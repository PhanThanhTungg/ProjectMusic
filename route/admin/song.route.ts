import { Router } from "express";
const route:Router = Router();
import * as controller from "../../controller/admin/song.controller";

route.post("/create", controller.createPOST);

export default route;