import express,{ Express } from "express";
const app:Express = express();

import cors from "cors";
const corsOrigin:string | boolean = process.env.CORS_ORIGIN == "*" ? true : process.env.CORS_ORIGIN;
app.use(cors(
  {
    origin: corsOrigin,
    credentials: true,
  }
));

import dotenv from "dotenv";
dotenv.config();

import bodyParser from 'body-parser'; 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



import cookieParser from 'cookie-parser';
app.use(cookieParser());

import {connectToDatabase} from "./config/connect.config";
connectToDatabase();

import adminRoute from "./route/admin/index.route";
adminRoute(app);

import clientRoute from "./route/client/index.route";
clientRoute(app);


const port:number = +process.env.PORT;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})