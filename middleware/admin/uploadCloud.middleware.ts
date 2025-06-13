import {v2 as cloudinary} from "cloudinary"
import streamifier from "streamifier";
import { Request, Response, NextFunction} from "express"
//cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});
//end cloudinary

const streamUpload = async (buffer:Buffer):Promise<any> => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const uploadSingle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req["file"]) {
    async function upload(req: Request): Promise<void> {
      let result = await streamUpload(req["file"].buffer);
      req.body[req["file"].fieldname] = result["secure_url"];
    }
    await upload(req);
  }
  next();
}
export const uploadMutiple = async(req: Request, res:Response, next:NextFunction) => {
  if (req["files"]) {
    for (const key of Object.keys(req["files"])) {
      let newArr = [];
      for (const item of req["files"][key]) {
        try {
          const result = await streamUpload(item.buffer);
          newArr.push(result["url"]);
        } catch (error) {
          console.log(error);
        }
      }
      req.body[key] = newArr;
    }
  }
  next();
}