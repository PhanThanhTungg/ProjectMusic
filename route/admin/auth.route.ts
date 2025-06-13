import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/admin/auth.controller";
import * as auth from "../../validation/admin/auth.validate";

route.post("/login",auth.login ,controller.login);

route.post("/refreshToken",controller.refreshToken);

export default route;