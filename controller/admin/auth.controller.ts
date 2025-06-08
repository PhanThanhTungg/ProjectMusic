import { Request, Response } from "express";
import Admin from "../../model/admin.model";
import bcrypt from "bcrypt";
import { ErrorResponse, SuccessResponse } from "../../types/admin/response.type";
import { genAccessToken, genRefreshToken, verifyToken } from "../../helper/jwtToken.helper";
import { saveCookie } from "../../helper/httpOnly.helper";
import { AuthLoginSuccess, tokenDecoded } from "../../types/admin/auth.type";


export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // check email, password in database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      const response: ErrorResponse = {
        message: "Email not found"
      };
      return res.status(404).json(response);
    }
    if (!bcrypt.compareSync(password, admin.password)) {
      const response: ErrorResponse = {
        message: "Incorrect password"
      };
      return res.status(401).json(response);
    }

    // gen access token and refresh token
    const accessToken: string = genAccessToken(admin._id.toString(), "admin");
    const refreshToken: string = genRefreshToken(admin._id.toString(), "admin");
    saveCookie(res, "adminRefreshToken", refreshToken);

    // response
    const response: AuthLoginSuccess = {
      message: "Login successful",
      accessToken,
      user: {
        type: "admin",
        id: admin._id.toString(),
        avatar: admin.avatar,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
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
    const refreshToken: string = req.cookies["adminRefreshToken"];

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
    const adminId: string = refreshTokenDecoded["id"];
    const type: string = refreshTokenDecoded["type"];

    // check adminId
    if (!adminId) {
      const response: ErrorResponse = {
        message: "Invalid refresh token",
        error: "Forbidden"
      };
      return res.status(403).json(response);
    }
    if (type !== "admin") {
      const response: ErrorResponse = {
        message: "Invalid token type",
        error: "Forbidden"
      };
      return res.status(403).json(response);
    }

    // find admin in database
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      const response: ErrorResponse = {
        message: "Admin not found",
        error: "Not Found"
      };
      return res.status(404).json(response);
    }

    // create new tokens
    const newAccessToken: string = genAccessToken(admin._id.toString(), "admin");
    const newRefreshToken: string = genRefreshToken(admin._id.toString(), "admin");
    saveCookie(res, "adminRefreshToken", newRefreshToken);

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

