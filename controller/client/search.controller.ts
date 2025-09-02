import { Request, Response } from "express";
import { resError1 } from "../../helper/resError.helper";
import songModel from "../../model/song.model";
import userModel from "../../model/user.model";
import albumModel from "../../model/album.model";
import { SearchInterface } from "../../interfaces/client/search.interface";

export const getSearch = async (req: Request, res: Response) => {
  try {
    const { keySearch } = req.query;

    const songs = await songModel.find({
      title: { $regex: keySearch, $options: "i" }
    }).populate("artistId", "fullName")
    .populate("albumId", "-__v -createdAt -updatedAt -listFollowers -idArtist")
    .populate("collaborationArtistIds", "fullName")
    .select("-background -description -lyrics -audio -updatedAt -__v ");

    const artists = await userModel.find({
      fullName: { $regex: keySearch, $options: "i" }
    }).select("fullName avatar");

    const albums = await albumModel.find({
      title: { $regex: keySearch, $options: "i" }
    }).select("title thumbnail slug")
    .populate("idArtist", "fullName avatar");

    const response: SearchInterface = {
      message: "Search success",
      songs: songs,
      artists: artists,
      albums: albums
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "error", res, 500);
  }
}