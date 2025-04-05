import { Router } from "express";
const route:Router = Router();
import * as controller from "../../controller/admin/song.controller";
import * as validate from "../../validation/admin/song.validate";


route.get("/", controller.indexGET);

route.post("/create", validate.createPOST,controller.createPOST);

route.patch("/update/:id", validate.createPOST, controller.updatePATCH);

route.patch("/delete/:id", controller.deletePATCH);
route.delete("/delete/:id", controller.deleteDELETE);

export default route;