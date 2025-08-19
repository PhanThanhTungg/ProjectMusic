import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/client/user.controller";
import * as auth from "../../validation/client/user.validate";
import * as userValidate from "../../validation/client/user.validate";
import { authAccessToken } from "../../middleware/client/auth.middleware";

route.post("/auth/register",auth.register ,controller.register);

route.post("/auth/login",controller.login);

route.post("/auth/refreshToken",controller.refreshToken);

route.get("/:id", controller.getUser)

route.patch("/", authAccessToken, userValidate.updateUser,controller.updateUser);

export default route;