import express,{ Express } from "express"
const app:Express = express()

import dotenv from "dotenv";
dotenv.config();

import {connectToDatabase} from "./config/connect.config";
connectToDatabase();

import adminRoute from "./route/admin/index.route";
adminRoute(app);


const port:number = +process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})