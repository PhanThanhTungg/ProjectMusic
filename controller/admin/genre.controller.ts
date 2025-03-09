import { Request, Response } from "express";
import genreModel from "../../model/genre.model";
import paginationHelper from "../../helper/pagination.helper";
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

    const currentPage:number = Number(req.query.page) || 1;
    const limit:number = Number(req.query.limit) || 8;
    const objectPagination  = paginationHelper(currentPage, limit, await genreModel.countDocuments(find));
    
    const genres = await genreModel.find(find).sort(sort)
    .skip(objectPagination["skip"]).limit(objectPagination["limit"]);
    res.json({
      code: 200,
      data: genres,
      objectPagination: objectPagination
    })
  } catch (error) {
    res.json({
      code: 400,
      message: error,
    })
  }

}