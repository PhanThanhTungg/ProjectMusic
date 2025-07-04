import { Express } from "express";
import genreRoute from "./genre.route";
import songRoute from "./song.route";
import authRoute from "./auth.route";
import system from "../../config/system";
import {authAccessToken} from "../../middleware/admin/auth.middleware";

export default (app:Express)=>{
  app.use(`/${system.prefixAdmin}`, authRoute);
  app.use(`/${system.prefixAdmin}/genre`, authAccessToken, genreRoute);
  app.use(`/${system.prefixAdmin}/song`, authAccessToken, songRoute);
}