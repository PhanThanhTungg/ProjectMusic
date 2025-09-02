import { Request, Response } from "express";
import Admin from "../../model/admin.model";
import bcrypt from "bcrypt";
import { ErrorResponse, SuccessResponse } from "../../interfaces/common/response.interface";
import { genAccessToken, genRefreshToken, verifyToken } from "../../helper/jwtToken.helper";
import { saveCookie } from "../../helper/httpOnly.helper";
import { tokenDecoded } from "../../interfaces/admin/auth.interface";
import { loginInputSchema } from "../../schema/admin/auth.schema";
import { resError1 } from "../../helper/resError.helper";


export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const loginData = loginInputSchema.safeParse(req.body);
    if (!loginData.success) {
      return resError1(loginData.error, JSON.parse(loginData.error.message)[0].message, res, 400);
    }
    
    const { email, password } = loginData.data;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return resError1(null, "Email not found", res, 404);
    }
    if (!bcrypt.compareSync(password, admin.password)) {
      return resError1(null, "Incorrect password", res, 401);
    }

    const accessToken: string = genAccessToken(admin._id.toString(), "admin");
    const refreshToken: string = genRefreshToken(admin._id.toString(), "admin");
    saveCookie(res, "adminRefreshToken", refreshToken);

    const response: SuccessResponse = {
      message: "Login successful",
      accessToken,
      user: admin
    }
    return res.status(200).json(response);

  } catch (error) {
    resError1(error, "Internal server error", res, 500);
  }
}

export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  try {
    const refreshToken: string = req.cookies["adminRefreshToken"];

    if (!refreshToken) {
      return resError1(null, "No refresh token provided", res, 401);
    }

    const refreshTokenDecoded: tokenDecoded | null = verifyToken(refreshToken, "refresh");
    if (!refreshTokenDecoded) {
      return resError1(null, "Invalid refresh token", res, 403);
    }
    if (refreshTokenDecoded.expired == true) {
      return resError1(null, "Refresh token expired", res, 403);
    }
    const adminId: string = refreshTokenDecoded["id"];
    const type: string = refreshTokenDecoded["type"];

    if (!adminId) {
      return resError1(null, "Invalid refresh token", res, 403);
    }
    if (type !== "admin") {
      return resError1(null, "Invalid token type", res, 403);
    }

    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      return resError1(null, "Admin not found", res, 404);
    }

    const newAccessToken: string = genAccessToken(admin._id.toString(), "admin");
    const newRefreshToken: string = genRefreshToken(admin._id.toString(), "admin");
    saveCookie(res, "adminRefreshToken", newRefreshToken);

    const response: SuccessResponse = {
      message: "Access token refreshed successfully",
      accessToken: newAccessToken
    };
    return res.status(200).json(response);

  } catch (error) {
    console.log(error);
    resError1(error, "Internal server error", res, 500);
  }
}

