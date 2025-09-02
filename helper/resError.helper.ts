import { ErrorResponse } from "../interfaces/common/response.interface";

export const resError1 = (error:any,message: string,res:any, statusCode: number = 500)=>{
  console.log("Have error: "+error);
  const errorResponse:ErrorResponse = {
    message,
    error
  }
  return res.status(statusCode).json(errorResponse);
}