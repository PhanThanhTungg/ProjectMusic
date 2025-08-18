import { Request, Response } from "express";
import songModel from "../../model/song.model";
import { resError1 } from "../../helper/resError.helper";
import {
  ErrorResponse,
  SuccessResponse,
} from "../../types/common/response.type";
import User from "../../model/user.model";
import {
  createSongSchema,
  CreateSongSchema,
} from "../../types/client/song.type";
import genreModel from "../../model/genre.model";
import mongoose from "mongoose";
import albumModel from "../../model/album.model";

const checkGenreAndAlbum = async (
  SongData: any,
  currentUser: any,
  res: Response
): Promise<void> => {
  // Check genre
  if (SongData.genreId) {
    const checkGenre = await genreModel.findOne({
      _id: new mongoose.Types.ObjectId(SongData.genreId),
      deleted: false,
    });
    if (!checkGenre) return resError1(null, "Genre not found", res, 404);
    if (checkGenre.status === "inactive")
      return resError1(null, "Genre is inactive", res, 400);
  }

  // Check album
  if (SongData.albumId) {
    const checkAlbum = await albumModel.findOne({
      _id: new mongoose.Types.ObjectId(SongData.albumId),
      deleted: false,
    });
    if (!checkAlbum) return resError1(null, "Album not found", res, 404);
    if (checkAlbum.idArtist.toString() !== currentUser._id.toString())
      return resError1(null, "You are not the artist of this album", res, 400);
  }
};

export const create = async (req: Request, res: Response): Promise<any> => {
  try {
    let createSongData = createSongSchema.safeParse(req.body);
    if (!createSongData.success) {
      return resError1(
        createSongData.error,
        JSON.parse(createSongData.error.message)[0].message,
        res,
        400
      );
    }

    const currentUser = res.locals.user;
    if (currentUser.verifyArtist === false)
      return resError1(null, "You are not an artist", res, 400);

    await checkGenreAndAlbum(createSongData.data, currentUser, res);

    const song = await songModel.create({
      ...createSongData.data,
      genreId: new mongoose.Types.ObjectId(createSongData.data.genreId),
      artistId: currentUser._id,
      ...(createSongData.data.albumId && {
        albumId: new mongoose.Types.ObjectId(createSongData.data.albumId),
      }),
    });

    const response: SuccessResponse = {
      message: "Song created successfully",
      data: song,
    };
    return res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
};

export const getAll = async (req: Request, res: Response): Promise<any> => {
  try {
    const songs = await songModel.find({
      status: "active",
      deleted: false,
    });
    res.json({
      code: 200,
      data: songs,
    });
  } catch (error) {
    resError1(error, "error", res);
  }
};

export const getDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const song = await songModel.findOne({
      slug: req.params.slug,
      status: "active",
      deleted: false,
    });

    if (!song) {
      const response: ErrorResponse = {
        message: "Song not found",
      };
    }

    const response: SuccessResponse = {
      message: "Song found",
      data: song,
    };
    res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
};

export const like = async (req: Request, res: Response): Promise<any> => {
  try {
    const song = await songModel.findOne({
      slug: req.params.slug,
      status: "active",
      deleted: false,
    });

    if (!song) {
      return res.status(404).json({
        message: "Song not found",
      });
    }

    // Check if the user has already liked the song
    if (res.locals.user.songsLiked.includes(song._id)) {
      await User.updateOne(
        {
          _id: res.locals.user._id,
        },
        {
          $pull: { songsLiked: song._id },
        }
      );

      const response: SuccessResponse = {
        message: "You unlike this song successfully",
      };
      return res.status(200).json(response);
    }

    // Add the user's ID to the likes array
    await User.updateOne(
      {
        _id: res.locals.user._id,
      },
      {
        $push: { songsLiked: song._id },
      }
    );

    const response: SuccessResponse = {
      message: "Song liked successfully",
    };
    res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
};
