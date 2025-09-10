import { Request, Response } from "express";
import {  
  getHybridRecommendations, 
  getCollaborativeRecommendations, 
  getContentBasedRecommendations, 
  getTrendingRecommendations
} from "../../helper/recommendation.helper";
import { resError1 } from "../../helper/resError.helper";
import { 
  getRecommendationsSchema, 
  getSimilarSongsSchema, 
  getUserPreferencesSchema 
} from "../../schema/client/recommendation.schema";
import { 
  RecommendationResponse, 
  UserPreferencesResponse, 
  SimilarSongsResponse 
} from "../../interfaces/client/recommendation.interface";
import songModel from "../../model/song.model";
import playHistoryModel from "../../model/playHistory.model";
import mongoose from "mongoose";

// get recommendations
export const getRecommendations = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = res.locals.user;
    
    // validate input
    const validationResult = getRecommendationsSchema.safeParse({
      type: req.query.type || "hybrid",
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    });
    if (!validationResult.success) return resError1(validationResult.error, JSON.parse(validationResult.error.message)[0].message, res, 400);
    
    const { type, limit} = validationResult.data;
    let recommendations;

    // call algorithm corresponding
    switch (type) {
      case "collaborative":
        recommendations = await getCollaborativeRecommendations(user.id, limit);
        break;
      case "content-based":
        recommendations = await getContentBasedRecommendations(user.id, limit);
        break;
      case "trending":
        recommendations = await getTrendingRecommendations(limit);
        break;
      case "hybrid":
      default:
        recommendations = await getHybridRecommendations(user.id, limit);
        break;
    }

    const response: RecommendationResponse = {
      message: "Recommendations retrieved successfully",
      recommendations,
      total: recommendations.length,
      type,
      generatedAt: new Date()
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in getRecommendations:", error);
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

// get user preferences
export const getUserPreferences = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = res.locals.user;
    if (!user) {
      return resError1(new Error("User not authenticated"), "User not authenticated", res, 401);
    }

    // Validate input
    const validationResult = getUserPreferencesSchema.safeParse({
      days: req.query.days ? parseInt(req.query.days as string) : 30
    });

    if (!validationResult.success) {
      return resError1(
        validationResult.error, 
        JSON.parse(validationResult.error.message)[0].message, 
        res, 
        400
      );
    }

    const { days } = validationResult.data;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Lấy thống kê chi tiết về sở thích
    const playHistory = await playHistoryModel.find({
      userId: new mongoose.Types.ObjectId(user.id),
      playDate: { $gte: startDate }
    }).populate('songId', 'title genreId artistId');

    // Phân tích genre yêu thích
    const genreStats = new Map<string, { genreId: string; genreName: string; playCount: number }>();
    const artistStats = new Map<string, { artistId: string; artistName: string; playCount: number }>();
    const songStats = new Map<string, { songId: string; title: string; playCount: number }>();
    
    let totalPlayTime = 0;
    let totalPlays = 0;

    playHistory.forEach(history => {
      const song = history.songId as any;
      if (!song) return;

      totalPlayTime += history.playDuration || 0;
      totalPlays++;

      // Genre stats
      const genreId = song.genreId?.toString();
      if (genreId) {
        const genreName = (song.genreId as any)?.title || 'Unknown Genre';
        const current = genreStats.get(genreId) || { genreId, genreName, playCount: 0 };
        current.playCount++;
        genreStats.set(genreId, current);
      }

      // Artist stats
      const artistId = song.artistId?.toString();
      if (artistId) {
        const artistName = (song.artistId as any)?.fullName || 'Unknown Artist';
        const current = artistStats.get(artistId) || { artistId, artistName, playCount: 0 };
        current.playCount++;
        artistStats.set(artistId, current);
      }

      // Song stats
      const songId = song._id.toString();
      const current = songStats.get(songId) || { songId, title: song.title, playCount: 0 };
      current.playCount++;
      songStats.set(songId, current);
    });

    // Sắp xếp và lấy top
    const favoriteGenres = Array.from(genreStats.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);

    const favoriteArtists = Array.from(artistStats.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);

    const recentSongs = Array.from(songStats.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 20);

    const response: UserPreferencesResponse = {
      message: "User preferences retrieved successfully",
      preferences: {
        favoriteGenres,
        favoriteArtists,
        recentSongs,
        totalPlayTime,
        averagePlayDuration: totalPlays > 0 ? totalPlayTime / totalPlays : 0
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in getUserPreferences:", error);
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

// get similar songs by song id
export const getSimilarSongs = async (req: Request, res: Response): Promise<any> => {
  try {
    // Validate input
    const validationResult = getSimilarSongsSchema.safeParse({
      songId: req.params.songId,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    });

    if (!validationResult.success) {
      return resError1(
        validationResult.error, 
        JSON.parse(validationResult.error.message)[0].message, 
        res, 
        400
      );
    }

    const { songId, limit } = validationResult.data;

    // Tìm bài hát gốc
    const originalSong = await songModel.findById(songId)
      .populate('artistId', 'fullName avatar')
      .populate('genreId', 'title')
      .populate('albumId', 'title thumbnail');

    if (!originalSong) {
      return resError1(new Error("Song not found"), "Song not found", res, 404);
    }

    // Tìm bài hát tương tự dựa trên genre và artist
    const similarSongs = await songModel.find({
      $and: [
        { _id: { $ne: new mongoose.Types.ObjectId(songId) } },
        { deleted: false },
        { status: "active" },
        {
          $or: [
            { genreId: originalSong.genreId },
            { artistId: originalSong.artistId },
            { collaborationArtistIds: originalSong.artistId }
          ]
        }
      ]
    })
    .populate('artistId', 'fullName avatar')
    .populate('genreId', 'title')
    .populate('albumId', 'title thumbnail')
    .sort({ playCount: -1, createdAt: -1 })
    .limit(limit * 2); // Lấy nhiều hơn để filter

    // Tính điểm tương tự
    const scoredSongs = similarSongs.map(song => {
      let score = 0;
      let reason = "";

      // Điểm cho cùng genre
      if (song.genreId?.toString() === originalSong.genreId?.toString()) {
        score += 0.4;
        reason += "Same genre";
      }

      // Điểm cho cùng artist
      if (song.artistId?.toString() === originalSong.artistId?.toString()) {
        score += 0.5;
        reason += reason ? ", same artist" : "Same artist";
      }

      // Điểm cho collaboration
      if (song.collaborationArtistIds?.includes(originalSong.artistId)) {
        score += 0.3;
        reason += reason ? ", collaboration" : "Collaboration";
      }

      // Điểm cho play count
      score += Math.min(song.playCount / 1000, 0.1);

      return {
        song,
        score: Math.min(score, 1.0),
        reason: reason || "Similar content"
      };
    });

    // Sắp xếp theo điểm và lấy top
    const topSimilarSongs = scoredSongs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    const response: SimilarSongsResponse = {
      message: "Similar songs retrieved successfully",
      similarSongs: topSimilarSongs,
      total: topSimilarSongs.length,
      basedOn: `"${originalSong.title}" by ${(originalSong.artistId as any)?.fullName || 'Unknown Artist'}`
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in getSimilarSongs:", error);
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

// get recommendation stats
export const getRecommendationStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // Thống kê tổng quan
    const [totalUsers, totalSongs, totalPlays] = await Promise.all([
      mongoose.connection.db.collection('users').countDocuments({ deleted: false }),
      mongoose.connection.db.collection('songs').countDocuments({ deleted: false, status: "active" }),
      mongoose.connection.db.collection('playhistories').countDocuments()
    ]);

    // Genre phổ biến nhất
    const mostPopularGenre = await playHistoryModel.aggregate([
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
        $lookup: {
          from: 'genres',
          localField: 'song.genreId',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $unwind: '$genre'
      },
      {
        $group: {
          _id: '$genre.title',
          playCount: { $sum: 1 }
        }
      },
      {
        $sort: { playCount: -1 }
      },
      {
        $limit: 1
      }
    ]);

    // Artist phổ biến nhất
    const mostPopularArtist = await playHistoryModel.aggregate([
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
        $lookup: {
          from: 'users',
          localField: 'song.artistId',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $unwind: '$artist'
      },
      {
        $group: {
          _id: '$artist.fullName',
          playCount: { $sum: 1 }
        }
      },
      {
        $sort: { playCount: -1 }
      },
      {
        $limit: 1
      }
    ]);

    const response = {
      message: "Recommendation statistics retrieved successfully",
      stats: {
        totalUsers,
        totalSongs,
        totalPlays,
        averageRecommendationScore: 0.75, // Có thể tính toán thực tế
        mostPopularGenre: mostPopularGenre[0]?._id || "Unknown",
        mostPopularArtist: mostPopularArtist[0]?._id || "Unknown"
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error in getRecommendationStats:", error);
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};