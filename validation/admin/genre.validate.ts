import { Request, Response, NextFunction } from "express"
export const createPOST = async (req:Request,res:Response, next:NextFunction)=>{
  if(!req.body.title){
    res.json({
      code: "400",
      message: "Please enter a title"
    })
    return;
  }
  next();
}