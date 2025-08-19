import { Router } from "express";
const route:Router = Router();

import * as controller from "../../controller/admin/auth.controller";

route.post("/login" ,controller.login);

route.post("/refreshToken",controller.refreshToken);

export default route;