import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/client/user.controller";
import * as userValidate from "../../validation/client/user.validate";
import { authAccessToken } from "../../middleware/client/auth.middleware";

route.post("/auth/register",controller.register);

route.post("/auth/login",controller.login);

route.post("/auth/refreshToken",controller.refreshToken);

route.post("/auth/logout", controller.logout);

route.get("/artists", authAccessToken, controller.getAllArtists);

route.get("/:id", controller.getUser);

route.patch("/", authAccessToken, userValidate.updateUser,controller.updateUser);

route.get("/follow/artists", authAccessToken, controller.getFollowArtists);

route.patch("/follow/:idArtist", authAccessToken, controller.followArtist);



export default route;