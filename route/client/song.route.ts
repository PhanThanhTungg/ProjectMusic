import {Router} from 'express';
const   route: Router = Router();
import * as controller from "../../controller/client/song.controller";

route.get("/getAll", controller.getAll);

route.get("/detail/:slug", controller.getDetail);

export default route;