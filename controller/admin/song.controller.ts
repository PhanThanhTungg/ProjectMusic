import { Request, Response } from "express";
import songModel from "../../model/song.model";
import { resError1 } from "../../helper/resError.helper";

export const indexGET = async (req: Request, res: Response): Promise<void> => {
  const songs = await songModel.find({
    status: "active",
    deleted: false
  })
  res.json({
    code: 200,
    data: songs
  })
}

export const createPOST = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, thumbnail, background, description, lyrics, audio } = req.body;
    const song = new songModel({ title, thumbnail, background, description, lyrics, audio });
    await song.save();
    res.json({
      code: 200,
      data: song
    })
  } catch (error) { resError1(error, res); }
}

export const updatePATCH = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, thumbnail, background, description, lyrics, audio } = req.body;
    const song = await songModel.findByIdAndUpdate(req.params.id, {
      title, thumbnail, background, description, lyrics, audio
    }, { new: true });
    //{ new: true }: tùy chọn này yêu cầu Mongoose trả về document đã được cập nhật, thay vì bản gốc trước khi cập nhật.
    res.json({
      code: 200,
      data: song
    })
  } catch (error) { resError1(error, res); }
}

export const deletePATCH = async (req: Request, res: Response): Promise<void> => {
  try {
    const song = await songModel.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    res.json({
      code: 200,
    })
  } catch (error) { resError1(error, res); }
}

export const deleteDELETE = async (req: Request, res: Response): Promise<void> => {
  try {
    const song = await songModel.findByIdAndDelete(req.params.id);
    res.json({
      code: 200
    })
  } catch (error) { resError1(error, res); }
}
