import { NextFunction, Request, Response } from "express";
import { tokenDecoded } from "../../types/admin/auth.type";
import { verifyToken } from "../../helper/jwtToken.helper";
import User from "../../model/user.model";

export const authAccessToken = async (req:Request, res:Response, next: NextFunction): Promise<any> => {
  // check bearer token
  const bearerToken = req.headers["authorization"];
  if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
    const response = {
      error: "Unauthorized access",
      message: "No token provided or invalid token format. Please provide a valid Bearer token.",
    }
    return res.status(401).json(response);
  }

  // check access token
  const accessToken = bearerToken.split(" ")[1];
  if (!accessToken) {
    const response = {
      error: "Unauthorized access",
      message: "No token provided. Please provide a valid Bearer token.",
    }
    return res.status(401).json(response);
  }

  // verify access token
  const tokenDecoded: tokenDecoded = verifyToken(accessToken, "access");
  if (!tokenDecoded) {
    const response = {
      error: "Unauthorized access",
      message: "Invalid token. Please login again.",
    }
    return res.status(401).json(response);
  }

  // verify user
  if(tokenDecoded.type !== "user"){
    const response = {
      error: "Unauthorized access",
      message: "You are not authorized to access this resource.",
    }
    return res.status(403).json(response);
  }

  // find user in database
  const userId = tokenDecoded.id;
  if (!userId) {
    const response = {
      error: "Unauthorized access",
      message: "Invalid token. User ID not found.",
    }
    return res.status(401).json(response);
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    const response = {
      error: "Unauthorized access",
      message: "User not found. Please login again.",
    }
    return res.status(401).json(response);
  }

  console.log("tokenDecoded", tokenDecoded);
  next();
}