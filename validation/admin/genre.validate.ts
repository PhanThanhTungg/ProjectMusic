import { Request, Response, NextFunction } from "express"
import { ErrorResponse } from "../../interfaces/common/response.interface";
export const createPOST = (req:Request,res:Response, next:NextFunction):void=>{
  if(!req.body.title){
    const response:ErrorResponse = {
      message: "Please enter a title"
    }
    res.status(400).json(response);
    return;
  }
  next();
}