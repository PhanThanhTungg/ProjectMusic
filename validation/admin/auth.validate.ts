import { NextFunction, Request, Response } from "express";

export const login = (req:Request,res:Response, next:NextFunction):any =>{
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  next();
}