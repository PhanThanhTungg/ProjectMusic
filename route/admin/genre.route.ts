import { Router } from "express";
const route = Router();
import * as controller from "../../controller/admin/genre.controller";
import * as genreValidation from "../../validation/admin/genre.validate";

route.post("/create",genreValidation.createPOST,controller.createPOST);

export default route;