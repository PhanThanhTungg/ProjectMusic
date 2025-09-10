
export interface RecommendationResult {
  song: object;
  score: number;
  reason: string;
}

export interface UserPreferences {
  favoriteGenres: string[];
  favoriteArtists: string[];
  recentSongs: string[];
  playFrequency: Map<string, number>;
}


export interface RecommendationResponse {
  message: string;
  recommendations: RecommendationResult[];
  total: number;
  type: string;
  generatedAt: Date;
}

export interface UserPreferencesResponse {
  message: string;
  preferences: {
    favoriteGenres: Array<{
      genreId: string;
      genreName: string;
      playCount: number;
    }>;
    favoriteArtists: Array<{
      artistId: string;
      artistName: string;
      playCount: number;
    }>;
    recentSongs: Array<{
      songId: string;
      title: string;
      playCount: number;
    }>;
    totalPlayTime: number;
    averagePlayDuration: number;
  };
}

export interface SimilarSongsResponse {
  message: string;
  similarSongs: RecommendationResult[];
  total: number;
  basedOn: string;
}

export interface RecommendationStats {
  totalUsers: number;
  totalSongs: number;
  totalPlays: number;
  averageRecommendationScore: number;
  mostPopularGenre: string;
  mostPopularArtist: string;
}
