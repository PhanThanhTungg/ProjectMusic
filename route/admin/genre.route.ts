import { Router } from "express";
const route = Router();
import * as controller from "../../controller/admin/genre.controller";

route.post("/create", controller.createPOST);

export default route;