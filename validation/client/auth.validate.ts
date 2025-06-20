import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../types/common/response.type";

export const login = (req:Request,res:Response, next:NextFunction):any =>{
  const { email, password } = req.body;
  if (!email) {
    const response: ErrorResponse = {
      message: "Email is required",
      error: "Bad Request"
    }
    return res.status(400).json(response);
  }
  if (!password) {
    const response: ErrorResponse = {
      message: "Password is required",
      error: "Bad Request"
    }
    return res.status(400).json(response);
  }
  next();
}
export const register = (req:Request,res:Response, next:NextFunction):any =>{
  const { email, fullName , password, confirmPassword } = req.body;
  if (!email) {
    const response: ErrorResponse = {
      message: "Email is required",
      error: "Bad Request"
    }
    return res.status(400).json(response);
  }

  if (!fullName) {
    const response: ErrorResponse = {
      message: "FullName is required",
      error: "Bad Request"
    }
    return res.status(400).json(response);
  }

  if (!password) {
    const response: ErrorResponse = {
      message: "Password is required",
      error: "Bad Request"
    }
    return res.status(400).json(response);
  }
  if (password !== confirmPassword) {
    const response: ErrorResponse = {
      message: "Passwords do not match",
      error: "Bad Request"
    }
    return res.status(400).json(response);
  }
  next();
}