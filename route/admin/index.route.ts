import { Express } from "express";
import genreRoute from "./genre.route";
import system from "../../config/system";

export default (app:Express)=>{
  app.use(`/${system.prefixAdmin}/genre`, genreRoute);
}