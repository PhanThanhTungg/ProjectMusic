import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { ErrorResponse, SuccessResponse } from "../../types/common/response.type";
import { genAccessToken, genRefreshToken, verifyToken } from "../../helper/jwtToken.helper";
import { saveCookie } from "../../helper/httpOnly.helper";
import User from "../../model/user.model";
import { AuthLoginSuccess, tokenDecoded } from "../../types/client/auth.type";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, password } = req.body;

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
      name,
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
    const { email, password } = req.body;

    // check email, password in database
    const user = await User.findOne({ email });
    if (!user) {
      const response: ErrorResponse = {
        message: "Email not found"
      };
      return res.status(404).json(response);
    }
    if (!bcrypt.compareSync(password, user.password)) {
      const response: ErrorResponse = {
        message: "Incorrect password"
      };
      return res.status(401).json(response);
    }

    // gen access token and refresh token
    const accessToken: string = genAccessToken(user._id.toString(), "user");
    const refreshToken: string = genRefreshToken(user._id.toString(), "user");
    saveCookie(res, "userRefreshToken", refreshToken);

    // response
    const response: AuthLoginSuccess = {
      message: "Login successful",
      accessToken,
      user: {
        type: "user",
        id: user._id.toString(),
        avatar: user.avatar,
        name: user.name,
        phone: user.phone,
        email: user.email,
      }
    }
    return res.status(200).json(response);

  } catch (error) {
    const response: ErrorResponse = {
      message: "Internal server error",
      error: error
    };
    return res.status(500).json(response);
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
    if (!refreshTokenDecoded) {
      const response: ErrorResponse = {
        message: "Invalid refresh token",
        error: "Forbidden"
      };
      return res.status(403).json(response);
    }
    if (refreshTokenDecoded.expired == true) {
      const response: ErrorResponse = {
        message: "Refresh token expired",
        error: "Forbidden"
      };
      return res.status(403).json(response);
    }
    const userId: string = refreshTokenDecoded["id"];
    const type: string = refreshTokenDecoded["type"];

    // check userId
    if (!userId) {
      const response: ErrorResponse = {
        message: "Invalid refresh token",
        error: "Forbidden"
      };
      return res.status(403).json(response);
    }
    if (type !== "user") {
      const response: ErrorResponse = {
        message: "Invalid token type",
        error: "Forbidden"
      };
      return res.status(403).json(response);
    }

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

