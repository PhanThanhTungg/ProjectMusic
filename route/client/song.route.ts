import {Router} from 'express';
const   route: Router = Router();
import * as controller from "../../controller/client/song.controller";
import {authAccessToken} from "../../middleware/client/auth.middleware";

// route for all user
route.get("/getAll", controller.getAll);

route.get("/detail/:slug", controller.getDetail);

route.get("/song-of-artist/:artistId", controller.getSongOfArtist);

route.post("/like/:slug", authAccessToken, controller.like)

// route only for artist
route.post("/artist", authAccessToken, controller.create);

route.patch("/artist/update-song/:id", authAccessToken, controller.update);

route.get("/artist/my-song", authAccessToken, controller.getMySong);

// play count route
route.get("/top/plays", controller.getTopSongsByPlayCount);

route.get("/history", authAccessToken, controller.getUserPlayHistory);

route.post("/play/:idSong", authAccessToken, controller.incrementPlayCount);

route.get("/stats/:idSong", controller.getSongPlayStats);

export default route;