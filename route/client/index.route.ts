import songRoute from "./song.route";
import userRoute from "./user.route";
import playlistRoute from "./playlist.route";
import albumRoute from "./album.route";
import searchRoute from "./search.route";
import recommendationRoute from "./recommendation.route";
import {Express} from "express";


export default (app: Express)=>{
  app.use("/user", userRoute);
  app.use("/song", songRoute);
  app.use("/playlist", playlistRoute);
  app.use("/album", albumRoute);
  app.use("/search", searchRoute);
  app.use("/recommendation", recommendationRoute);
}