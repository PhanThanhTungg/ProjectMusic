import mongoose from "mongoose";
import playHistoryModel from "../model/playHistory.model";
import songModel from "../model/song.model";
import { RecommendationResult, UserPreferences } from "../interfaces/client/recommendation.interface";

// get user preferences 
export const getUserPreferences = async (userId: string, days: number = 30): Promise<UserPreferences> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // get play history in the time range
  const playHistory = await playHistoryModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    playDate: { $gte: startDate }
  }).populate('songId', 'title genreId artistId');

  // analyze preferences
  const genreCount = new Map<string, number>();
  const artistCount = new Map<string, number>();
  const songCount = new Map<string, number>();
  const recentSongs: string[] = [];

  playHistory.forEach(history => {
    const song = history.songId as any;
    if (!song) return;

    // count genre
    const genreId = song.genreId?.toString();
    if (genreId) {
      genreCount.set(genreId, (genreCount.get(genreId) || 0) + 1);
    }

    // count artist
    const artistId = song.artistId?.toString();
    if (artistId) {
      artistCount.set(artistId, (artistCount.get(artistId) || 0) + 1);
    }

    // count song
    const songId = song._id.toString();
    songCount.set(songId, (songCount.get(songId) || 0) + 1);
    recentSongs.push(songId);
  });

  // sort and get top
  const favoriteGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreId]) => genreId);

  const favoriteArtists = Array.from(artistCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([artistId]) => artistId);

  return {
    favoriteGenres,
    favoriteArtists,
    recentSongs: recentSongs.slice(0, 20), // Top 20 songs recently
    playFrequency: songCount
  };
};

// get collaborative recommendations
export const getCollaborativeRecommendations = async (
  userId: string, 
  limit: number = 20
): Promise<RecommendationResult[]> => {
  const userPreferences = await getUserPreferences(userId);
  
  if (userPreferences.favoriteGenres.length === 0) {
    return [];
  }

  // find similar users
  const similarUsers = await findSimilarUsers(userId, userPreferences);
  
  // get songs from similar users
  const recommendations = await getSongsFromSimilarUsers(similarUsers, userId, limit);
  
  return recommendations;
};

// get content based recommendations
export const getContentBasedRecommendations = async (
  userId: string,
  limit: number = 20
): Promise<RecommendationResult[]> => {
  const userPreferences = await getUserPreferences(userId);
  
  if (userPreferences.favoriteGenres.length === 0) {
    return [];
  }

  // Lấy bài hát từ genre yêu thích
  const genreRecommendations = await getSongsByGenres(
    userPreferences.favoriteGenres, 
    userPreferences.recentSongs,
    limit
  );

  // Lấy bài hát từ artist yêu thích
  const artistRecommendations = await getSongsByArtists(
    userPreferences.favoriteArtists,
    userPreferences.recentSongs,
    limit
  );

  // Kết hợp và tính điểm
  const allRecommendations = [...genreRecommendations, ...artistRecommendations];
  const scoredRecommendations = scoreRecommendations(allRecommendations, userPreferences);
  
  return scoredRecommendations.slice(0, limit);
};

/**
 * Thuật toán đề xuất Trending/Popular
 */
export const getTrendingRecommendations = async (
  limit: number = 20
): Promise<RecommendationResult[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Lấy bài hát trending dựa trên play count gần đây
  const trendingSongs = await playHistoryModel.aggregate([
    {
      $match: {
        playDate: { $gte: sevenDaysAgo },
        isCompleted: true
      }
    },
    {
      $group: {
        _id: "$songId",
        playCount: { $sum: 1 },
        lastPlayed: { $max: "$playDate" }
      }
    },
    {
      $sort: { playCount: -1, lastPlayed: -1 }
    },
    {
      $limit: limit * 2 // Lấy nhiều hơn để filter
    }
  ]);

  // Populate thông tin bài hát
  const songIds = trendingSongs.map(item => item._id);
  const songs = await songModel.find({
    _id: { $in: songIds },
    deleted: false,
    status: "active"
  }).populate('artistId', 'fullName avatar')
    .populate('genreId', 'title')
    .populate('albumId', 'title thumbnail');

  const recommendations: RecommendationResult[] = songs.map(song => ({
    song,
    score: 0.8, // Trending songs có điểm cao
    reason: 'Trending'
  }));

  return recommendations.slice(0, limit);
};

// find similar users
const findSimilarUsers = async (
  userId: string, 
  userPreferences: UserPreferences
): Promise<string[]> => {
  // find users with same favorite genres
  const similarUsers = await playHistoryModel.aggregate([
    {
      $match: {
        userId: { $ne: new mongoose.Types.ObjectId(userId) },
        playDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $lookup: {
        from: 'songs',
        localField: 'songId',
        foreignField: '_id',
        as: 'song'
      }
    },
    {
      $unwind: '$song'
    },
    {
      $match: {
        'song.genreId': { $in: userPreferences.favoriteGenres.map(id => new mongoose.Types.ObjectId(id)) }
      }
    },
    {
      $group: {
        _id: '$userId',
        commonGenres: { $addToSet: '$song.genreId' },
        playCount: { $sum: 1 }
      }
    },
    {
      $match: {
        playCount: { $gte: 3 } // Ít nhất 3 lần nghe
      }
    },
    {
      $sort: { playCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return similarUsers.map(user => user._id.toString());
};

// get songs from similar users
const getSongsFromSimilarUsers = async (
  similarUserIds: string[],
  currentUserId: string,
  limit: number
): Promise<RecommendationResult[]> => {
  if (similarUserIds.length === 0) return [];

  const recommendations = await playHistoryModel.aggregate([
    {
      $match: {
        userId: { $in: similarUserIds.map(id => new mongoose.Types.ObjectId(id)) },
        playDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $lookup: {
        from: 'songs',
        localField: 'songId',
        foreignField: '_id',
        as: 'song'
      }
    },
    {
      $unwind: '$song'
    },
    {
      $match: {
        'song.deleted': false,
        'song.status': 'active'
      }
    },
    {
      $group: {
        _id: '$songId',
        playCount: { $sum: 1 },
        song: { $first: '$song' }
      }
    },
    {
      $sort: { playCount: -1 }
    },
    {
      $limit: limit
    }
  ]);

  const songIds = recommendations.map(rec => rec._id);
  const songs = await songModel.find({
    _id: { $in: songIds },
    deleted: false,
    status: "active"
  }).populate('artistId', 'fullName avatar')
    .populate('genreId', 'title')
    .populate('albumId', 'title thumbnail');

  return songs.map(song => ({
    song,
    score: 0.7,
    reason: 'Similar users'
  }));
};

/**
 * Lấy bài hát theo genre
 */
const getSongsByGenres = async (
  genreIds: string[],
  excludeSongIds: string[],
  limit: number
): Promise<RecommendationResult[]> => {
  const songs = await songModel.find({
    genreId: { $in: genreIds.map(id => new mongoose.Types.ObjectId(id)) },
    _id: { $nin: excludeSongIds.map(id => new mongoose.Types.ObjectId(id)) },
    deleted: false,
    status: "active"
  })
  .populate('artistId', 'fullName avatar')
  .populate('genreId', 'title')
  .populate('albumId', 'title thumbnail')
  .sort({ playCount: -1, createdAt: -1 })
  .limit(limit);

  return songs.map(song => ({
    song,
    score: 0.6,
    reason: 'Based on your favorite genres'
  }));
};

/**
 * Lấy bài hát theo artist
 */
const getSongsByArtists = async (
  artistIds: string[],
  excludeSongIds: string[],
  limit: number
): Promise<RecommendationResult[]> => {
  const songs = await songModel.find({
    $or: [
      { artistId: { $in: artistIds.map(id => new mongoose.Types.ObjectId(id)) } },
      { collaborationArtistIds: { $in: artistIds.map(id => new mongoose.Types.ObjectId(id)) } }
    ],
    _id: { $nin: excludeSongIds.map(id => new mongoose.Types.ObjectId(id)) },
    deleted: false,
    status: "active"
  })
  .populate('artistId', 'fullName avatar')
  .populate('genreId', 'title')
  .populate('albumId', 'title thumbnail')
  .sort({ playCount: -1, createdAt: -1 })
  .limit(limit);

  return songs.map(song => ({
    song,
    score: 0.5,
    reason: 'From your favorite artists'
  }));
};

/**
 * Tính điểm cho các đề xuất
 */
const scoreRecommendations = (
  recommendations: RecommendationResult[],
  userPreferences: UserPreferences
): RecommendationResult[] => {
  return recommendations.map(rec => {
    let score = rec.score;
    
    // Tăng điểm nếu genre yêu thích
    if (userPreferences.favoriteGenres.includes(rec.song['genreId'])) {
      score += 0.2;
    }
    
    // Tăng điểm nếu artist yêu thích
    if (userPreferences.favoriteArtists.includes(rec.song['artistId'])) {
      score += 0.3;
    }
    
    return {
      ...rec,
      score: Math.min(score, 1.0) // Giới hạn điểm tối đa là 1.0
    };
  }).sort((a, b) => b.score - a.score);
};

/**
 * Thuật toán đề xuất hybrid kết hợp nhiều phương pháp
 */
export const getHybridRecommendations = async (
  userId: string,
  limit: number = 20
): Promise<RecommendationResult[]> => {
  try {
    // Lấy đề xuất từ các phương pháp khác nhau
    const [collaborative, contentBased, trending] = await Promise.all([
      getCollaborativeRecommendations(userId, Math.ceil(limit * 0.4)),
      getContentBasedRecommendations(userId, Math.ceil(limit * 0.4)),
      getTrendingRecommendations(Math.ceil(limit * 0.2))
    ]);

    // Kết hợp và loại bỏ trùng lặp
    const allRecommendations = [...collaborative, ...contentBased, ...trending];
    const uniqueRecommendations = new Map<string, RecommendationResult>();

    allRecommendations.forEach(rec => {
      if (!uniqueRecommendations.has(rec.song['_id'])) {
        uniqueRecommendations.set(rec.song['_id'], rec);
      } else {
        // Nếu trùng, lấy điểm cao hơn
        const existing = uniqueRecommendations.get(rec.song['_id'])!;
        if (rec.score > existing.score) {
          uniqueRecommendations.set(rec.song['_id'], rec);
        }
      }
    });

    // Sắp xếp theo điểm số và trả về
    return Array.from(uniqueRecommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Error in hybrid recommendations:', error);
    // Fallback về trending nếu có lỗi
    return getTrendingRecommendations(limit);
  }
};
