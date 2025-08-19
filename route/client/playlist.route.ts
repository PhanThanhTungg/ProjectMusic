import {Router} from 'express';
const route: Router = Router();
import * as controller from "../../controller/client/playlist.controller";

route.get("/follow",controller.getListFollowPlaylist);

route.post("/follow/:id", controller.followPlaylist);

route.get("/", controller.getAllPlaylistOfUser);

route.post("/", controller.createPlaylist);

route.get("/:slug", controller.getDetailPlaylist);

route.patch("/:id", controller.updatePlaylist);

route.delete("/:id", controller.deletePlaylist);

route.post("/:playlistId/:typeAction/:idSong", controller.addRemoveSongToPlaylist);

export default route;