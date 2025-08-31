import { ErrorResponse } from "../interfaces/common/response.type";

export const resError1 = (error:any,message: string,res:any, statusCode: number = 500)=>{
  console.log("Have error: "+error);
  const errorResponse:ErrorResponse = {
    message,
    error
  }
  res.status(statusCode).json(errorResponse);
}