import { Request, Response, NextFunction } from "express"
export const createPOST = async (req:Request,res:Response, next:NextFunction)=>{
  const requiredFields = ["title", "audio"];
  for (const field of requiredFields) {
    if (!req.body[field]) {
      res.json({
        code: "400",
        message: `Please enter a ${field}`
      })
      return;
    }
  }
  if (req.body.audio && !req.body.audio.startsWith("http")) {
    res.json({
      code: "400",
      message: "Audio must be a valid URL"
    })
    return;
  }
  if (req.body.thumbnail && !req.body.thumbnail.startsWith("http")) {
    res.json({
      code: "400",
      message: "Thumbnail must be a valid URL"
    })
    return;
  }
  if (req.body.background && !req.body.background.startsWith("http")) {
    res.json({
      code: "400",
      message: "Background must be a valid URL"
    })
    return;
  }
  
  next();
}