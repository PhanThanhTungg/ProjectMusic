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

export const indexGET = async (req:Request,res:Response):Promise<void>=>{
  try {
    const find = {
      deleted: false
    }

    if(req.query.status) find["status"] = req.query.status;

    const sort = {};
    if(req.query.sortKey && req.query.sortValue){
      sort[`${req.query.sortKey}`] = req.query.sortValue;
    }

    

    const genres = await genreModel.find(find).sort(sort);
    res.json({
      code: 200,
      data: genres
    })
  } catch (error) {
    res.json({
      code: 400,
      message: error,
    })
  }

}