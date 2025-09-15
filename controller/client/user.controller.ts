import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  ErrorResponse,
  SuccessResponse,
} from "../../interfaces/common/response.interface";
import {
  genAccessToken,
  genRefreshToken,
  verifyToken,
} from "../../helper/jwtToken.helper";
import { saveCookie } from "../../helper/httpOnly.helper";
import User from "../../model/user.model";
import {
  AuthLoginSuccess,
  tokenDecoded,
} from "../../interfaces/client/auth.interface";
import { resError1 } from "../../helper/resError.helper";
import {
  loginInputSchema,
  registerInputSchema,
} from "../../schema/client/user.schema";
import { GetUserInterface } from "../../interfaces/client/user.interface";
import songModel from "../../model/song.model";
import albumModel from "../../model/album.model";
import playlistModel from "../../model/playlist.model";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const registerData = registerInputSchema.safeParse(req.body);
    if (!registerData.success)
      return resError1(
        registerData.error,
        JSON.parse(registerData.error.message)[0].message,
        res,
        400
      );

    const { email, fullName, password } = registerData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return resError1(
        new Error("Email already exists"),
        "Email already exists",
        res,
        400
      );

    const newUser = new User({
      email,
      fullName,
      password,
    });
    await newUser.save();

    const response: SuccessResponse = {
      message: "User registered successfully",
    };
    return res.status(201).json(response);
  } catch (error) {
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const loginData = loginInputSchema.safeParse(req.body);
    if (!loginData.success)
      return resError1(
        loginData.error,
        JSON.parse(loginData.error.message)[0].message,
        res,
        400
      );
    const { email, password } = loginData.data;

    const user = await User.findOne({ email }).lean();
    if (!user)
      return resError1(new Error("User not found"), "User not found", res, 404);
    if (!bcrypt.compareSync(password, user.password))
      return resError1(
        new Error("Invalid password"),
        "Invalid password",
        res,
        401
      );

    const accessToken: string = genAccessToken(user._id.toString(), "user");
    const refreshToken: string = genRefreshToken(user._id.toString(), "user");
    saveCookie(res, "userRefreshToken", refreshToken);

    delete user.password;

    const response: AuthLoginSuccess = {
      message: "Login successful",
      accessToken,
      user,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const refreshToken: string = req.cookies["userRefreshToken"];

    if (!refreshToken) {
      return resError1(
        new Error("No refresh token provided"),
        "No refresh token provided",
        res,
        401
      );
    }

    const refreshTokenDecoded: tokenDecoded | null = verifyToken(
      refreshToken,
      "refresh"
    );
    if (!refreshTokenDecoded)
      return resError1(
        new Error("Invalid refresh token"),
        "Invalid refresh token",
        res,
        403
      );
    if (refreshTokenDecoded.expired == true)
      return resError1(
        new Error("Refresh token expired"),
        "Refresh token expired",
        res,
        403
      );

    const userId: string = refreshTokenDecoded["id"];
    const type: string = refreshTokenDecoded["type"];
    if (!userId)
      return resError1(
        new Error("User ID not found in token"),
        "User ID not found in token",
        res,
        403
      );
    if (type !== "user")
      return resError1(
        new Error("Invalid token type"),
        "Invalid token type",
        res,
        403
      );

    const user = await User.findOne({ _id: userId });
    if (!user)
      return resError1(new Error("User not found"), "User not found", res, 404);

    const newAccessToken: string = genAccessToken(user._id.toString(), "user");
    const newRefreshToken: string = genRefreshToken(
      user._id.toString(),
      "user"
    );
    saveCookie(res, "userRefreshToken", newRefreshToken);

    const response: Omit<AuthLoginSuccess, "user"> = {
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    res.clearCookie("userRefreshToken");
    const response: SuccessResponse = {
      message: "Logout successful",
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

export const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      _id: id,
      deleted: false,
      status: "active",
    }).select("-password -deleted -status -updatedAt");

    if (!user)
      return resError1(new Error("User not found"), "User not found", res, 404);

    let top5NewestSongs: any[] | null = null;
    let albums: any[] | null = null;

    if (user.verifyArtist === true) {
      top5NewestSongs = await songModel
        .find({ artistId: user._id, deleted: false })
        .populate("artistId", "fullName avatar")
        .populate("collaborationArtistIds", "fullName avatar")
        .populate("albumId", "title thumbnail")
        .populate("genreId", "title")
        .sort({ createdAt: -1 })
        .limit(5);
      albums = await albumModel.find({ idArtist: user._id, deleted: false });
    }

    const playlists = await playlistModel.find({
      idUser: user._id,
      status: "public",
    });

    const response: GetUserInterface = {
      message: "User found",
      user: user,
      top5NewestSongs: top5NewestSongs,
      playlists: playlists,
      albums: albums,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, error.message || "Internal server error", res, 500);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = res.locals.user;
    const body = req.body;
    const newUser = await User.findOneAndUpdate({ _id: user.id }, body, {
      new: true,
    }).select("-password -deleted -status -updatedAt");
    const response: SuccessResponse = {
      message: "User updated successfully",
      user: newUser,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Internal server error", res);
  }
};

export const getAllArtists = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const artists = await User.find({
      verifyArtist: true,
      deleted: false,
      status: "active",
    });
    const response: SuccessResponse = {
      message: "Artists found",
      artists,
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Internal server error", res);
  }
};

export const followArtist = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user = res.locals.user;
    const { idArtist } = req.params;
    if (user.id === idArtist)
      return resError1(
        new Error("You cannot follow yourself"),
        "You cannot follow yourself",
        res,
        400
      );
    const artist = await User.findOne({
      _id: idArtist,
      deleted: false,
      status: "active",
      verifyArtist: true,
    });
    if (!artist)
      return resError1(
        new Error("Artist not found"),
        "Artist not found",
        res,
        404
      );

    if (user.artistsFollowed.includes(idArtist)) {
      user.artistsFollowed = user.artistsFollowed.filter(
        (artist) => artist.toString() !== idArtist
      );
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await user.save({ session });
          await User.updateOne(
            { _id: idArtist },
            { $inc: { followCount: -1 } },
            { session }
          );
        });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
      const response: SuccessResponse = {
        message: "Unfollow artist successfully",
      };
      return res.status(200).json(response);
    } else {
      user.artistsFollowed.push(idArtist);
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await user.save({ session });
          await User.updateOne(
            { _id: idArtist },
            { $inc: { followCount: 1 } },
            { session }
          );
        });
        
        const response: SuccessResponse = {
          message: "Follow artist successfully",
        };
        return res.status(200).json(response);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    }
  } catch (error) {
    return resError1(error, "Internal server error", res);
  }
};
