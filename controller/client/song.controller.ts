import { Request, Response } from 'express';
import songModel from '../../model/song.model';
import { resError1 } from '../../helper/resError.helper';

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
  } catch (error) {resError1(error, res);}
}