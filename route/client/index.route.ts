import songRoute from "./song.route";
import userRoute from "./user.route";
import {Express} from "express";


export default (app: Express)=>{
  app.use("/user", userRoute);
  app.use("/song", songRoute);
}