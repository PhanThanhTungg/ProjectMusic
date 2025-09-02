import {Router} from 'express';
const route: Router = Router();
import * as controller from "../../controller/client/album.controller";
import {authAccessToken} from "../../middleware/client/auth.middleware";
import { checkArtist } from '../../middleware/client/artist.middleware';

route.get("/", authAccessToken, controller.getAlbum);

route.get("/:id", controller.getDetailAlbum);

route.post("/", authAccessToken, checkArtist, controller.createAlbum);

route.patch("/:id", authAccessToken, checkArtist, controller.updateAlbum);

route.delete("/:id", authAccessToken, checkArtist, controller.deleteAlbum);

route.post("/:albumId/add-song/:songId", authAccessToken, checkArtist, controller.addSongToAlbum);

route.post("/follow/:albumId", authAccessToken, controller.followAlbum);



export default route;