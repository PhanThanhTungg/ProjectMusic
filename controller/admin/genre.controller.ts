import { Request, Response } from "express";
import genreModel from "../../model/genre.model";
import paginationHelper from "../../helper/pagination.helper";
import { createGenreSchema } from "../../schema/admin/genre.schema";
import { resError1 } from "../../helper/resError.helper";
import { SuccessResponse } from "../../types/common/response.type";

export const createPOST = async (req:Request,res:Response):Promise<any>=>{
  try {
    const genreData = createGenreSchema.safeParse(req.body);
    if (!genreData.success) {
      return resError1(genreData.error, JSON.parse(genreData.error.message)[0].message, res, 400);
    }

    const genre = new genreModel(genreData.data);
    await genre.save();

    const response: SuccessResponse = {
      message: "Genre created successfully",
      data: genre
    }
    return res.status(200).json(response);
  } catch (error) {
    resError1(error, "Internal server error", res, 500);
  }
}
export const indexGET = async (req:Request,res:Response):Promise<any>=>{
  try {
    const find = {
      deleted: false
    }

    if(req.query.status) find["status"] = req.query.status;

    const sort = {};
    if(req.query.sortKey && req.query.sortValue){
      sort[`${req.query.sortKey}`] = req.query.sortValue;
    }

    const currentPage:number = +req.query.page || 1;
    const limit:number = +req.query.limit || 8;
    const objectPagination  = paginationHelper(currentPage, limit, await genreModel.countDocuments(find));
    
    const genres = await genreModel.find(find).sort(sort)
    .skip(objectPagination["skip"]).limit(objectPagination["limit"]);

    const response: SuccessResponse = {
      message: "Genres fetched successfully",
      data: genres,
      objectPagination: objectPagination
    }
    return res.status(200).json(response);
  } catch (error) {
    resError1(error, "Internal server error", res, 500);
  }

}