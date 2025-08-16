import { Request, Response } from "express";
import Playlist from "../../model/playlist.model";
import { createPlayListSchema, updatePlayListSchema } from "../../types/client/playlist.type";
import mongoose from "mongoose";
import { resError1 } from "../../helper/resError.helper";
import songModel from "../../model/song.model";
import { SuccessResponse } from "../../types/common/response.type";

export const getAllPlaylistOfUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const playlists = await Playlist.aggregate([
      { $match: { idUser: new mongoose.Types.ObjectId(res.locals.user.id) } },
      { $addFields: { songsCount: { $size: "$songs" } } },
      { $project: { songs: 0, __v: 0 } }
    ]);
    
    const response: SuccessResponse = {
      message: "Get all playlist successfully",
      playlists
    }
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "error", res);
  }
};

export const getDetailPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { slug } = req.params;
    const playlist = await Playlist.findOne({
      slug: slug
    }).populate("songs");

    // check playlist is valid
    if(!playlist){
      return resError1(null, "Playlist not found", res, 404);
    }

    // check permission
    if(playlist.status === "private" && playlist.idUser.toString() !== res.locals.user.id){
      return resError1(null, "You don't have permission to access this playlist", res, 403);
    }

    const response: SuccessResponse = {
      message: "Get detail playlist successfully",
      playlist
    }
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "error", res);
  }
};

export const createPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const createPlayListData = createPlayListSchema.safeParse(req.body);
    if (!createPlayListData.success) {
      return resError1(
        createPlayListData.error,
        JSON.parse(createPlayListData.error.message)[0].message,
        res,
        400
      );
    }
    const id = res.locals.user.id;

    const playlist = await Playlist.create({
      ...createPlayListData.data,
      idUser: new mongoose.Types.ObjectId(id),
    });
    return res.status(201).json(playlist);
  } catch (error) {
    return resError1(error, "error", res);
  }
};

export const updatePlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // check playlist is valid
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return resError1(null, "Playlist not found", res, 404);
    }

    // check user is owner of playlist
    if (playlist.idUser.toString() !== res.locals.user.id) {
      return resError1(null, "You are not the owner of this playlist", res, 403);
    }

    const updatePlayListData = updatePlayListSchema.safeParse(req.body);
    if (!updatePlayListData.success) {
      return resError1(updatePlayListData.error,JSON.parse(updatePlayListData.error.message)[0].message,res,400
      );
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(id, updatePlayListData.data, { new: true });

    const response: SuccessResponse = {
      message: "Update playlist successfully",
      playlist: updatedPlaylist
    }
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "error", res);
  }
}

export const deletePlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // check playlist is valid
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return resError1(null, "Playlist not found", res, 404);
    }

    // check user is owner of playlist
    if (playlist.idUser.toString() !== res.locals.user.id) {
      return resError1(null, "You are not the owner of this playlist", res, 403);
    }

    await Playlist.findByIdAndDelete(id);
    const response: SuccessResponse = {
      message: "Delete playlist successfully",
    }
    return res.status(200).json(response);
  }catch(error){
    return resError1(error, "error", res);
  }
}

export const addSongToPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // check playlistId is valid
    const { playlistId, idSong } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return resError1(null, "Playlist not found", res, 404);
    }

    // check user is owner of playlist
    if (playlist.idUser.toString() !== res.locals.user.id) {
      return resError1(
        null,
        "You are not the owner of this playlist",
        res,
        403
      );
    }

    // check song is valid
    const song = await songModel.findById(idSong);
    if (!song) {
      return resError1(null, "Song not found", res, 404);
    }

    // check song is already in playlist
    if (playlist.songs.includes(new mongoose.Types.ObjectId(idSong))) {
      playlist.songs = playlist.songs.filter(
        (song) => song.toString() !== idSong
      );
      await playlist.save();
      const response: SuccessResponse = {
        message: "Song removed from playlist",
      };
      return res.status(200).json(response);
    } else {
      playlist.songs.push(new mongoose.Types.ObjectId(idSong));
      await playlist.save();
      const response: SuccessResponse = {
        message: "Song added to playlist",
      };
      return res.status(200).json(response);
    }
  } catch (error) {
    return resError1(error, "error", res);
  }
};

export const getListFollowPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const playlists = await Playlist.aggregate([
      { $match: { listFollowers: { $in: [new mongoose.Types.ObjectId(res.locals.user.id)] } } },
      { $addFields: { songsCount: { $size: "$songs" } } },
      { $project: { songs: 0, __v: 0 } }
    ]);
    const response: SuccessResponse = {
      message: "Get list follow playlist successfully",
      playlists
    }
    return res.status(200).json(response);
  }catch(error){
    return resError1(error, "error", res);
  }
}

export const followPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    // check playlist is valid
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return resError1(null, "Playlist not found", res, 404);
    }

    // check user is owner of playlist
    if (playlist.idUser.toString() === res.locals.user.id) {
      return resError1(null, "You are the owner of this playlist", res, 403);
    }

    // check user is already following this playlist
    if (playlist.listFollowers.includes(new mongoose.Types.ObjectId(res.locals.user.id))) {
      playlist.listFollowers = playlist.listFollowers.filter(
        (follower) => follower.toString() !== res.locals.user.id
      );
      await playlist.save();
      const response: SuccessResponse = {
        message: "Unfollow playlist successfully",
      };
      return res.status(200).json(response);
    }else{
      playlist.listFollowers.push(new mongoose.Types.ObjectId(res.locals.user.id));
      await playlist.save();
      const response: SuccessResponse = {
        message: "Follow playlist successfully",
      };
      return res.status(200).json(response);
    }
  }catch(error){
    return resError1(error, "error", res);
  }
}
