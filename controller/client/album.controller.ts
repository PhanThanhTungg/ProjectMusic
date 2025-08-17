import { Request, Response } from "express";
import {
  createAlbumSchema,
  updateAlbumSchema,
} from "../../types/client/album.type";
import { resError1 } from "../../helper/resError.helper";
import albumModel from "../../model/album.model";
import mongoose from "mongoose";
import { SuccessResponse } from "../../types/common/response.type";
import songModel from "../../model/song.model";

export const getAlbum = async (req: Request, res: Response): Promise<any> => {
  try {
    const albums = await albumModel.find({
      idArtist: new mongoose.Types.ObjectId(res.locals.user.id),
      deleted: false,
    });

    const response: SuccessResponse = {
      message: "Get album success",
      albums,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Have error when get album", res, 500);
  }
};

export const getDetailAlbum = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const album = await albumModel
      .findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        deleted: false,
      })
      .populate("songs")
      .populate("idArtist")
      .select("-__v")
      .lean();

    album["artist"] = album.idArtist;
    delete album.idArtist;
    delete album["artist"].password;
    delete album["artist"]["__v"];

    if (!album) {
      return resError1(null, "Album not found", res, 404);
    }
    return res.status(200).json(album);
  } catch (error) {
    return resError1(error, "Have error when get detail album", res, 500);
  }
};

export const createAlbum = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const createAlbumData = createAlbumSchema.safeParse(req.body);
    if (!createAlbumData.success) {
      return resError1(
        createAlbumData.error,
        JSON.parse(createAlbumData.error.message)[0].message,
        res,
        400
      );
    }

    const idArtist = res.locals.user.id;

    const album = await albumModel.create({
      ...createAlbumData.data,
      idArtist: new mongoose.Types.ObjectId(idArtist),
    });

    const response: SuccessResponse = {
      message: "Create album success",
      album,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Have error when create album", res, 500);
  }
};

export const updateAlbum = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const updateAlbumData = updateAlbumSchema.safeParse(req.body);
    if (!updateAlbumData.success) {
      return resError1(
        updateAlbumData.error,
        JSON.parse(updateAlbumData.error.message)[0].message,
        res,
        400
      );
    }

    const checkAlbum = await albumModel.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      idArtist: new mongoose.Types.ObjectId(res.locals.user.id),
      deleted: false,
    });

    if (!checkAlbum) {
      return resError1(null, "Album not found", res, 404);
    }

    const album = await albumModel
      .findByIdAndUpdate(req.params.id, updateAlbumData.data, { new: true })
      .select("-__v");

    const response: SuccessResponse = {
      message: "Update album success",
      album,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Have error when update album", res, 500);
  }
};

export const deleteAlbum = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkAlbum = await albumModel.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      idArtist: new mongoose.Types.ObjectId(res.locals.user.id),
      deleted: false,
    });

    if (!checkAlbum) {
      return resError1(null, "Album not found", res, 404);
    }

    await albumModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
      {
        deleted: true,
      }
    );

    const response: SuccessResponse = {
      message: "Delete album success",
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Have error when delete album", res, 500);
  }
};

export const addSongToAlbum = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkAlbum = await albumModel.findOne({
      _id: new mongoose.Types.ObjectId(req.params.albumId),
      idArtist: new mongoose.Types.ObjectId(res.locals.user.id),
      deleted: false,
    });
    if (!checkAlbum) {
      return resError1(null, "Album not found", res, 404);
    }

    const checkSong = await songModel.findOne({
      _id: new mongoose.Types.ObjectId(req.params.songId),
      artistId: new mongoose.Types.ObjectId(res.locals.user.id),
      deleted: false,
    });
    if (!checkSong) {
      return resError1(null, "Song not found", res, 404);
    }

    if (checkSong.albumId) {
      if(checkSong.albumId.toString() === req.params.albumId){
        await songModel.updateOne(
          {
            _id: new mongoose.Types.ObjectId(req.params.songId),
          },
          {
            albumId: null,
          }
        );
        const response: SuccessResponse = {
          message: "Remove song from album success",
        };
        return res.status(200).json(response);
      }
      else{
        return resError1(null, "Song already in different album", res, 400);
      }
    } else {
      await songModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(req.params.songId),
        },
        {
          albumId: new mongoose.Types.ObjectId(req.params.albumId),
        }
      );

      const response: SuccessResponse = {
        message: "Add song to album success",
      };
      return res.status(200).json(response);
    }
  } catch (error) {
    return resError1(error, "Have error when add song to album", res, 500);
  }
};

export const followAlbum = async (req: Request, res: Response): Promise<any> => {
  try {
    const idUser = res.locals.user.id;
    const idAlbum = req.params.albumId;

    const checkAlbum = await albumModel.findOne({
      _id: new mongoose.Types.ObjectId(idAlbum),
      deleted: false,
    });

    if (!checkAlbum) {
      return resError1(null, "Album not found", res, 404);
    }

    if(checkAlbum.listFollowers.includes(res.locals.user.id)){
      await albumModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(idAlbum),
        },
        {
          $pull: { listFollowers: new mongoose.Types.ObjectId(idUser) },
        }
      );
      const response: SuccessResponse = {
        message: "Unfollow album success",
      };
      return res.status(200).json(response);
    }else{
      await albumModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(idAlbum),
        },
        {
          $push: { listFollowers: new mongoose.Types.ObjectId(idUser) },
        }
      );
      const response: SuccessResponse = {
        message: "Follow album success",
      };
      return res.status(200).json(response);
    }
  } catch (error) {
    return resError1(error, "Have error when follow album", res, 500);
  }
};