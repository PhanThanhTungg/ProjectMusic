import songRoute from "./song.route";
import authRoute from "./auth.route";
import {Express} from "express";


export default (app: Express)=>{
  app.use("/auth", authRoute);
  app.use("/song", songRoute);
}