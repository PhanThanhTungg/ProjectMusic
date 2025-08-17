import {Router} from 'express';
const route: Router = Router();
import * as controller from "../../controller/client/album.controller";
import {authAccessToken} from "../../middleware/client/auth.middleware";

route.get("/", authAccessToken, controller.getAlbum);

route.get("/:id", controller.getDetailAlbum);

route.post("/", authAccessToken, controller.createAlbum);

route.patch("/:id", authAccessToken, controller.updateAlbum);

route.delete("/:id", authAccessToken, controller.deleteAlbum);

route.post("/:albumId/add-song/:songId", authAccessToken, controller.addSongToAlbum);

route.post("/follow/:albumId", authAccessToken, controller.followAlbum);



export default route;