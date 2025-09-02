import { Request, Response } from "express";
import songModel from "../../model/song.model";
import { resError1 } from "../../helper/resError.helper";
import {
  ErrorResponse,
  SuccessResponse,
} from "../../interfaces/common/response.interface";
import User from "../../model/user.model";
import {
  createSongSchema,
  incrementPlayCountSchema,
  updateSongSchema,
} from "../../schema/client/song.schema";
import genreModel from "../../model/genre.model";
import mongoose from "mongoose";
import albumModel from "../../model/album.model";
import paginationHelper from "../../helper/pagination.helper";
import { Pagination } from "../../interfaces/admin/common.interface";
import { GetMySongInterface } from "../../interfaces/client/song.interface";
import playHistoryModel from "../../model/playHistory.model";
import { PlayCountHelper } from "../../helper/playCount.helper";
import userModel from "../../model/user.model";

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
    if (!createSongData.success)
      return resError1(
        createSongData.error,
        JSON.parse(createSongData.error.message)[0].message,
        res,
        400
      );

    // check collaboration artist
    if (createSongData.data.collaborationArtistIds) {
      const collaborationArtistIds =
        createSongData.data.collaborationArtistIds.map(
          (id: string) => new mongoose.Types.ObjectId(id)
        );
      const collaborationArtists = await User.find({
        _id: { $in: collaborationArtistIds },
      });
      if (collaborationArtists.length !== collaborationArtistIds.length) {
        return resError1(
          null,
          "Some collaboration artists not found",
          res,
          404
        );
      }
      if (
        collaborationArtists.some((artist) => artist.verifyArtist === false)
      ) {
        return resError1(
          null,
          "Some collaboration artists are not verified",
          res,
          400
        );
      }
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
    const songs = await songModel
      .find({
        status: "active",
        deleted: false,
      })
      .populate("artistId", "fullName")
      .populate("albumId", "title slug")
      .populate("collaborationArtistIds", "fullName")
      .select("-background -description -lyrics -updatedAt -__v");

    const response: SuccessResponse = {
      message: "Songs found",
      data: songs,
    };
    return res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
};

export const getDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const song = await songModel
      .findOne({
        slug: req.params.slug,
        status: "active",
        deleted: false,
      })
      .populate("artistId", "fullName")
      .populate("albumId", "title slug")
      .populate("collaborationArtistIds", "fullName");

    if (!song) return resError1(null, "Song not found", res, 404);

    const response: SuccessResponse = {
      message: "Song found",
      data: song,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "error", res, 500);
  }
};

export const getSongOfArtist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const artist = await User.findOne({
      _id: req.params.artistId,
    });
    if (!artist) {
      return resError1(null, "Artist not found", res, 404);
    }

    const songs = await songModel
      .find({
        artistId: artist._id,
        status: "active",
        deleted: false,
      })
      .populate("albumId", "title slug")
      .populate("collaborationArtistIds", "fullName")
      .select("-background -description -lyrics -audio -updatedAt -__v ");

    const response: SuccessResponse = {
      message: "Songs found",
      data: songs,
    };
    return res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
};

export const getMySong = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUser = res.locals.user;
    if (currentUser.verifyArtist === false)
      return resError1(null, "You are not an artist", res, 400);

    //sort
    const { sortKey, sortValue } = req.query;
    const sort = {};
    if (sortKey && sortValue) sort[sortKey + ""] = sortValue;

    // pagination
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 8;
    const objectPagination: Pagination = paginationHelper(
      page,
      limit,
      await songModel.countDocuments({
        artistId: currentUser._id,
        deleted: false,
      })
    );

    const songs = await songModel
      .find({
        artistId: currentUser._id,
        deleted: false,
      })
      .sort(sort)
      .skip(objectPagination.skip)
      .limit(objectPagination.limit);

    const response: GetMySongInterface = {
      message: "Songs found",
      songs,
      pagination: objectPagination,
    };
    return res.status(200).json(response);
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
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await User.updateOne(
          {
            _id: res.locals.user._id,
          },
          {
            $pull: { songsLiked: song._id },
          },
          { session }
        );

        await songModel.updateOne(
          {
            _id: song._id,
          },
          {
            $inc: { like: -1 },
          },
          { session }
        );

        await session.commitTransaction();
      } catch (transactionError) {
        await session.abortTransaction();
        throw transactionError;
      } finally {
        session.endSession();
      }

      const response: SuccessResponse = {
        message: "You unlike this song successfully",
      };
      return res.status(200).json(response);
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await User.updateOne(
        {
          _id: res.locals.user._id,
        },
        {
          $push: { songsLiked: song._id },
        },
        { session }
      );

      await songModel.updateOne(
        {
          _id: song._id,
        },
        {
          $inc: { like: 1 },
        },
        { session }
      );

      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

    const response: SuccessResponse = {
      message: "Song liked successfully",
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "error", res, 500);
  }
};

export const getAllLike = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUser = res.locals.user;
    const songs = await userModel
      .findOne({
        _id: currentUser._id,
      })
      .populate({
        path: "songsLiked",
        populate: [
          {
            path: "artistId",
            select: "fullName",
          },
          {
            path: "albumId",
            select: "title slug",
          },
          {
            path: "collaborationArtistIds",
            select: "fullName",
          },
        ],
      })
      .select("songsLiked");

    return res.status(200).json({
      message: "Get all like successfully",
      songsLiked: songs.songsLiked,
    });
  } catch (error) {
    return resError1(error, error.message || "error", res, 500);
  }
};

export const update = async (req: Request, res: Response): Promise<any> => {
  try {
    const currentUser = res.locals.user;
    if (currentUser.verifyArtist === false)
      return resError1(null, "You are not an artist", res, 400);

    const song = await songModel.findOne({
      _id: req.params.id,
      artistId: currentUser._id,
      deleted: false,
    });
    if (!song) {
      return resError1(null, "Song not found", res, 404);
    }

    const updateSongData = updateSongSchema.safeParse(req.body);
    if (!updateSongData.success)
      return resError1(
        updateSongData.error,
        JSON.parse(updateSongData.error.message)[0].message,
        res,
        400
      );

    const updatedSong = await songModel.findByIdAndUpdate(
      req.params.id,
      updateSongData.data,
      { new: true }
    );

    const response: SuccessResponse = {
      message: "Song updated successfully",
      updatedSong,
    };
    return res.status(200).json(response);
  } catch (error) {
    resError1(error, "error", res);
  }
};

export const incrementPlayCount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { idSong } = req.params;
    const currentUser = res.locals.user;

    const incrementPlayCountData = incrementPlayCountSchema.safeParse(req.body);
    if (!incrementPlayCountData.success)
      return resError1(
        incrementPlayCountData.error,
        JSON.parse(incrementPlayCountData.error.message)[0].message,
        res,
        400
      );

    const { playDuration, isCompleted } = incrementPlayCountData.data;

    if (isCompleted && playDuration < 30) {
      return resError1(
        null,
        "Cannot mark as completed with duration less than 30 seconds",
        res,
        400
      );
    }

    const song = await songModel.findOne({
      _id: idSong,
      status: "active",
      deleted: false,
    });

    if (!song) {
      return resError1(null, "Song not found or inactive", res, 404);
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    console.log(
      `Play count request - User: ${currentUser._id}, Song: ${idSong}, Duration: ${playDuration}s, Completed: ${isCompleted}, IP: ${ipAddress}`
    );

    const result = await PlayCountHelper.incrementPlayCount(
      currentUser._id.toString(),
      song._id.toString(),
      playDuration,
      isCompleted,
      ipAddress,
      userAgent
    );

    if (!result.success) {
      // Log failed attempts
      console.warn(
        `Play count failed - User: ${currentUser._id}, Song: ${idSong}, Reason: ${result.message}`
      );

      // Nếu bị chặn do spam, trả về thông tin chi tiết
      if (result.message.includes("suspicious activity")) {
        return res.status(403).json({
          message: result.message,
          error: "SPAM_DETECTED",
          timestamp: new Date().toISOString(),
        });
      }

      return resError1(null, result.message, res, 400);
    }

    // Log successful operation
    console.log(
      `Play count success - User: ${currentUser._id}, Song: ${idSong}, New Count: ${result.playCount}`
    );

    const response: SuccessResponse = {
      message: result.message,
      data: {
        playCount: result.playCount,
        isNewPlay: result.isNewPlay,
        songId: idSong,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Unexpected error in incrementPlayCount:", error);
    return resError1(
      error,
      "Unexpected error occurred while incrementing play count",
      res
    );
  }
};

export const getSongPlayStats = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { slug } = req.params;

    const song = await songModel.findOne({
      slug,
      status: "active",
      deleted: false,
    });

    if (!song) {
      return resError1(null, "Song not found", res, 404);
    }

    const { PlayCountHelper } = await import("../../helper/playCount.helper");
    const stats = await PlayCountHelper.getSongPlayStats(song._id.toString());

    if (!stats) {
      return resError1(null, "Error getting song statistics", res, 500);
    }

    const response: SuccessResponse = {
      message: "Song statistics retrieved successfully",
      data: stats,
    };

    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Error getting song statistics", res);
  }
};

export const getTopSongsByPlayCount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const limit = +(req.query.limit as string) || 10;

    if (limit > 100) {
      return resError1(null, "Limit cannot exceed 100", res, 400);
    }

    const { PlayCountHelper } = await import("../../helper/playCount.helper");
    const topSongs = await PlayCountHelper.getTopSongsByPlayCount(limit);

    const response: SuccessResponse = {
      message: "Top songs by play count retrieved successfully",
      data: topSongs,
    };

    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Error getting top songs", res);
  }
};

export const getUserPlayHistory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const currentUser = res.locals.user;
    const page = +(req.query.page as string) || 1;
    const limit = +(req.query.limit as string) || 20;

    if (limit > 100) {
      return resError1(null, "Limit cannot exceed 100", res, 400);
    }

    const objectPagination = paginationHelper(
      page,
      limit,
      await playHistoryModel.countDocuments({ userId: currentUser._id })
    );

    const playHistory = await playHistoryModel
      .find({ userId: currentUser._id })
      .populate("songId", "title thumbnail slug artistId")
      .sort({ playDate: -1 })
      .skip(objectPagination.skip)
      .limit(objectPagination.limit);

    const response: SuccessResponse = {
      message: "User play history retrieved successfully",
      data: {
        playHistory,
        pagination: objectPagination,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Error getting user play history", res);
  }
};
