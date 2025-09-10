import { Router } from "express";
import { 
  getRecommendations, 
  getUserPreferences, 
  getSimilarSongs, 
  getRecommendationStats 
} from "../../controller/client/recommendation.controller";
import { authAccessToken, checkUser } from "../../middleware/client/auth.middleware";

const router = Router();

router.get("/", authAccessToken, getRecommendations);

router.get("/preferences", authAccessToken, getUserPreferences);

router.get("/similar/:songId", checkUser, getSimilarSongs);

router.get("/stats", getRecommendationStats);

export default router;
