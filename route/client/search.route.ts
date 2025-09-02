import { Router } from "express";
import * as controller from "../../controller/client/search.controller";

const searchRouter = Router();

searchRouter.get("/", controller.getSearch);

export default searchRouter;