import { Request, Response } from 'express';
import songModel from '../../model/song.model';
import { resError1 } from '../../helper/resError.helper';
import { ErrorResponse, SuccessResponse } from '../../types/common/response.type';
import User from '../../model/user.model';

export const getAll = async (req: Request, res:Response):Promise<any>=>{
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

export const getDetail = async(req: Request, res: Response):Promise<any>=>{
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

export const like = async (req: Request, res: Response): Promise<any> => {
  try {
    const song = await songModel.findOne({
      slug: req.params.slug,
      status: "active",
      deleted: false
    });

    if (!song) {
      return res.status(404).json({
        message: "Song not found"
      });
    }

    // Check if the user has already liked the song
    if (res.locals.user.songsLiked.includes(song._id)) {
      await User.updateOne({
        _id: res.locals.user._id
      }, {
        $pull: { songsLiked: song._id }
      });
      
      const response:SuccessResponse={
        message: "You unlike this song successfully",
      }
      return res.status(200).json(response);
    }

    // Add the user's ID to the likes array
    await User.updateOne({
      _id: res.locals.user._id
    }, {
      $push: { songsLiked: song._id }
    })


    const response: SuccessResponse = {
      message: "Song liked successfully"
    };
    res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
}

