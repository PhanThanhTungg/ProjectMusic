import { ErrorResponse } from "../types/common/response.type";

export const resError1 = (error:any,message: string,res:any)=>{
  console.log("Have error: "+error);
  console.log(error);
  const errorResponse:ErrorResponse = {
    message,
    error
  }
  res.status(500).json(errorResponse);
}