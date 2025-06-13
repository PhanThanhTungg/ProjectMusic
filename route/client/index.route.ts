import songRoute from "./song.route";
import {Express} from "express";

export default (app: Express)=>{
  app.use("/song", songRoute);
}