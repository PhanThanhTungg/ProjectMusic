import { NextFunction, Request, Response } from "express";
import { resError1 } from "../../helper/resError.helper";

export const checkArtist = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  if(user.verifyArtist === false) return resError1(new Error("User is not an artist"), "User is not an artist", res, 400);
  next();
}