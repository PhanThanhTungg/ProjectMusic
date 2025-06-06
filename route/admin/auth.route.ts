import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/admin/auth.controller";

route.get("/login", controller.login);

export default route;