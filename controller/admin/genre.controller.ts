import { Request, Response } from "express"
import genreModel from "../../model/genre.model"
export const createPOST = async (req:Request,res:Response):Promise<void>=>{
  try {
    const genre = new genreModel({
      title: req.body.title,
      thumbnail: req.body.thumbnail,
      description: req.body.description
    })
    await genre.save();
    res.json({
      code: 200,
      message: "create genre successfully",
      data: genre
    })

  } catch (error) {
    res.json({
      code: 400,
      message: error,
    })
  }
}