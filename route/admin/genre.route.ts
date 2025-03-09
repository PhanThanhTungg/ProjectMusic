import { Router } from "express";
const route = Router();
import * as controller from "../../controller/admin/genre.controller";
import * as genreValidation from "../../validation/admin/genre.validate";
import {uploadSingle} from "../../middleware/admin/uploadCloud.middleware"; 

import multer from "multer";
const upload = multer();

route.get("/", controller.indexGET)

route.post("/create",
  upload.single("thumbnail"),
  uploadSingle,
  genreValidation.createPOST,
  controller.createPOST
);


export default route;