export const resError1 = (error:any, res:any)=>{
  console.log("Have error: "+error);
  console.log(error);
  res.json({
    code: error.code || 400,
    message: error.message || "Error",
  }) 
}