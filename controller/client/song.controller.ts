import { Request, Response } from 'express';
import songModel from '../../model/song.model';
import { resError1 } from '../../helper/resError.helper';
import { ErrorResponse, SuccessResponse } from '../../types/common/response.type';

export const getAll = async (req: Request, res:Response)=>{
  try {
    const songs = await songModel.find({
      status: "active",
      deleted: false
    })
    res.json({
      code: 200,  
      data: songs
    })
  } catch (error) {resError1(error, "error",res);}
}

export const getDetail = async(req: Request, res: Response)=>{
  try {
    const song = await songModel.findOne({
      slug: req.params.slug,
      status: "active",
      deleted: false
    })

    if (!song) {
      const response: ErrorResponse = {
        message: "Song not found"
      }
    }

    const response: SuccessResponse = {
      message: "Song found",
      data: song
    }
    res.status(200).json(response);
  } catch (error) {resError1(error, "error",res);}
}

