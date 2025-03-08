import { Request, Response } from "express"
import genreModel from "../../model/genre.model"
export const createPOST = async (req:Request,res:Response):Promise<void>=>{
  console.log(req.body);
  res.json({
    code: 200
  })
}