import { Express } from "express";
import genreRoute from "./genre.route";
import songRoute from "./song.route";
import system from "../../config/system";

export default (app:Express)=>{
  app.use(`/${system.prefixAdmin}/genre`, genreRoute);
  app.use(`/${system.prefixAdmin}/song`, songRoute);
}