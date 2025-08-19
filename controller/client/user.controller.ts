import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ErrorResponse, SuccessResponse } from "../../types/common/response.type";
import { genAccessToken, genRefreshToken, verifyToken } from "../../helper/jwtToken.helper";
import { saveCookie } from "../../helper/httpOnly.helper";
import User from "../../model/user.model";
import { AuthLoginSuccess, tokenDecoded } from "../../types/client/auth.type";
import { resError1 } from "../../helper/resError.helper";
import { loginInputSchema } from "../../schema/client/user.schema";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, fullName, password } = req.body;

    // check email, name, password in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const response: ErrorResponse = {
        message: "Email already exists",
        error: "Conflict"
      };
      return res.status(409).json(response);
    }

    // create new user
    const newUser = new User({
      email,
      fullName,
      password
    });
    await newUser.save();

    const response: SuccessResponse = {
      message: "User registered successfully"
    };
    return res.status(201).json(response);
  } catch (error) {
    const response: ErrorResponse = {
      message: "Internal server error",
      error: error
    };
    return res.status(500).json(response);
  }
}

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // validate input
    const loginData = loginInputSchema.safeParse(req.body);
    if (!loginData.success)
      return resError1(loginData.error, JSON.parse(loginData.error.message)[0].message, res, 400);
    const { email, password } = loginData.data;

    // check email, password in database
    const user = await User.findOne({ email }).lean();
    if (!user) return resError1(new Error("User not found"), "User not found", res, 404);
    if (!bcrypt.compareSync(password, user.password))
      return resError1(new Error("Invalid password"), "Invalid password", res, 401);

    // gen access token and refresh token
    const accessToken: string = genAccessToken(user._id.toString(), "user");
    const refreshToken: string = genRefreshToken(user._id.toString(), "user");
    saveCookie(res, "userRefreshToken", refreshToken);

    delete user.password;

    // response
    const response: AuthLoginSuccess = {
      message: "Login successful",
      accessToken,
      user
    }
    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    return resError1(error, "Internal server error", res);
  }
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken: string = req.cookies["userRefreshToken"];

    // check refresh token
    if (!refreshToken) {
      const response: ErrorResponse = {
        message: "No refresh token provided",
        error: "Unauthorized"
      };
      return res.status(401).json(response);
    }

    // verify refresh token
    const refreshTokenDecoded: tokenDecoded | null = verifyToken(refreshToken, "refresh");
    if (!refreshTokenDecoded) return resError1(new Error("Invalid refresh token"), "Invalid refresh token", res, 403);
    if (refreshTokenDecoded.expired == true) return resError1(new Error("Refresh token expired"), "Refresh token expired", res, 403);
    const userId: string = refreshTokenDecoded["id"];
    const type: string = refreshTokenDecoded["type"];

    // check userId
    if (!userId) return resError1(new Error("User ID not found in token"), "User ID not found in token", res, 403);
    if (type !== "user") return resError1(new Error("Invalid token type"), "Invalid token type", res, 403);
    
    // find user in database
    const user = await User.findOne({ _id: userId });
    if (!user) {
      const response: ErrorResponse = {
        message: "User not found",
        error: "Not Found"
      };
      return res.status(404).json(response);
    }

    // create new tokens
    const newAccessToken: string = genAccessToken(user._id.toString(), "user");
    const newRefreshToken: string = genRefreshToken(user._id.toString(), "user");
    saveCookie(res, "userRefreshToken", newRefreshToken);

    // respond
    const response: Omit<AuthLoginSuccess, "user"> = {
      message: "Access token refreshed successfully",
      accessToken: newAccessToken
    };
    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    const response: ErrorResponse = {
      message: "Internal server error",
      error: error
    };
    return res.status(500).json(response);
  }
}

export const getUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, deleted: false, status: "active" })
      .select("-password -deleted -status -updatedAt");

    if (!user) {
      return resError1(new Error("User not found"), "User not found", res, 404);
    }

    const response: SuccessResponse = {
      message: "User found",
      user: user
    };
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Internal server error", res);
  }
}

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = res.locals.user;
    const body = req.body;
    const newUser = await User.findOneAndUpdate({ _id: user.id }, body, { new: true }).select("-password -deleted -status -updatedAt");
    const response: SuccessResponse = {
      message: "User updated successfully",
      user: newUser
    }
    return res.status(200).json(response);
  } catch (error) {
    return resError1(error, "Internal server error", res);
  }
}

