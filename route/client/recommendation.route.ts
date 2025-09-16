import { Router } from "express";
import { 
  getRecommendations, 
  getUserPreferences, 
  getSimilarSongs, 
  getRecommendationStats, 
  getAlbumRecommendation,
  getArtistRecommendation,
  getPlaylistRecommendation,
  getRecommendationsFromSongs
} from "../../controller/client/recommendation.controller";
import { authAccessToken, checkUser } from "../../middleware/client/auth.middleware";

const router = Router();

router.get("/", checkUser, getRecommendations);

router.get("/album", checkUser, getAlbumRecommendation);

router.get("/artist", checkUser, getArtistRecommendation);

router.get("/playlist", checkUser, getPlaylistRecommendation);

router.post("/by-songs", getRecommendationsFromSongs);

// router.get("/preferences", authAccessToken, getUserPreferences);

// router.get("/similar/:songId", checkUser, getSimilarSongs);

// router.get("/stats", getRecommendationStats);

export default router;
