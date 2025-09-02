import {Router} from 'express';
const route: Router = Router();
import * as controller from "../../controller/client/playlist.controller";
import { authAccessToken } from '../../middleware/admin/auth.middleware';

route.get("/follow",authAccessToken,controller.getListFollowPlaylist);

route.post("/follow/:id", authAccessToken, controller.followPlaylist);

route.get("/", controller.getAllPlaylistOfUser);

route.post("/", authAccessToken ,controller.createPlaylist);

route.get("/:slug", controller.getDetailPlaylist);

route.patch("/:id", authAccessToken, controller.updatePlaylist);

route.delete("/:id", authAccessToken, controller.deletePlaylist);

route.post("/:playlistId/:typeAction/:idSong", authAccessToken, controller.addRemoveSongToPlaylist);

export default route;