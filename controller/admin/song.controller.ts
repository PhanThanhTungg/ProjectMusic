import { Request, Response } from "express";
import songModel from "../../model/song.model";
import { resError1 } from "../../helper/resError.helper";

export const createPOST = async(req: Request, res: Response): Promise<void> => {
  try {
    const song = new songModel(req.body);
    await song.save();
    res.json({
      code: 200,
      data: song
    })
  } catch (error) {resError1(error, res);}
}