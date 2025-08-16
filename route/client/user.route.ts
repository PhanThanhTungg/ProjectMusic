import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/client/user.controller";
import * as auth from "../../validation/client/user.validate";

route.post("/auth/register",auth.register ,controller.register);

route.post("/auth/login",auth.login ,controller.login);

route.post("/auth/refreshToken",controller.refreshToken);

route.get("/:id", controller.getUser)

export default route;