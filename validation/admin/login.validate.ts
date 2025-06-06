import { NextFunction, Request, Response } from "express";
import Admin from "../../model/admin.model";

export const login = async (req:Request,res:Response, next:NextFunction):Promise<any> =>{
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  next();
}