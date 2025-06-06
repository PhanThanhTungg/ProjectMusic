import { Request, Response } from "express";
import Admin from "../../model/admin.model";
import bcrypt from "bcrypt";
import { ErrorRespone } from "../../types/admin/response.type";
import { genAccessToken, genRefreshToken } from "../../helper/jwtToken.helper";
import { saveCookie } from "../../helper/httpOnly.helper";
import { AuthLoginSuccess } from "../../types/admin/auth.type";


export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // check email, password in database
    const admin = await Admin.findOne({ email });
    if (!admin) {
      const response: ErrorRespone = {
        message: "Email not found"
      };
      return res.status(404).json(response);
    }
    if (!bcrypt.compareSync(password, admin.password)) {
      const response: ErrorRespone = {
        message: "Incorrect password"
      };
      return res.status(401).json(response);
    }

    // gen access token and refresh token
    const accessToken:string = genAccessToken(admin._id.toString(), "admin");
    const refreshToken:string = genRefreshToken(admin._id.toString(), "admin");
    saveCookie(res, "adminRefreshToken", refreshToken);

    // response
    const response:AuthLoginSuccess = {
      message: "Login successful",
      accessToken
    }
    return res.status(200).json(response);
    
  } catch (error) {
    const response: ErrorRespone = {
      message: "Internal server error",
      error: error
    };
    return res.status(500).json(response);
  }
}