import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/client/auth.controller";
import * as auth from "../../validation/client/auth.validate";

route.post("/register",auth.register ,controller.register);

route.post("/login",auth.login ,controller.login);

route.post("/refreshToken",controller.refreshToken);

export default route;