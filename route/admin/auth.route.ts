import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/admin/auth.controller";
import * as auth from "../../validation/admin/auth.validate";

route.get("/login",auth.login ,controller.login);

export default route;