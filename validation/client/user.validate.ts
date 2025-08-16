import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../../types/common/response.type";
import { resError1 } from "../../helper/resError.helper";
import validator from 'validator';

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
export const updateUser = (req:Request,res:Response, next:NextFunction):any =>{
  const user = res.locals.user;
  const body = req.body;
  if(body.verifyArtist == true){
    if(!user.phone && !body.phone) return resError1(new Error("Phone is required"), "Phone is required to verify artist", res, 400);
    if(user.gender == "unknown" && (body.gender == "unknown" || !body.gender)) return resError1(new Error("Gender is required"), "Gender is required to verify artist", res, 400);
    if(!user.dateOfBirth && !body.dateOfBirth) return resError1(new Error("Date of birth is required"), "Date of birth is required to verify artist", res, 400);
    if(!user.country && !body.country) return resError1(new Error("Country is required"), "Country is required to verify artist", res, 400);
  }

  if(body.email){
    const checkEmail = validator.isEmail(body.email);
    if(!checkEmail) return resError1(new Error("Invalid email"), "Invalid email", res, 400);
  }

  if(body.phone){
    const checkPhone = validator.isMobilePhone(body.phone);
    if(!checkPhone) return resError1(new Error("Invalid phone"), "Invalid phone", res, 400);
  }

  if(body.avatar){
    const checkAvatarUrl = validator.isURL(body.avatar);
    if(!checkAvatarUrl) return resError1(new Error("Invalid avatar url"), "Invalid avatar url", res, 400);
  }
  next();
}