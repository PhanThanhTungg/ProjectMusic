import {Router} from 'express';
const   route: Router = Router();
import * as controller from "../../controller/client/song.controller";
import {authAccessToken} from "../../middleware/client/auth.middleware";

route.post("/", authAccessToken, controller.create);

route.get("/getAll", controller.getAll);

route.get("/detail/:slug", controller.getDetail);

route.post("/like/:slug", authAccessToken, controller.like)

export default route;