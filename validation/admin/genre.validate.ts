import { Request, Response, NextFunction } from "express"
import { ErrorRespone } from "../../types/admin/response.type";
export const createPOST = (req:Request,res:Response, next:NextFunction):void=>{
  if(!req.body.title){
    const response:ErrorRespone = {
      message: "Please enter a title"
    }
    res.status(400).json(response);
    return;
  }
  next();
}