"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const corsOrigin = process.env.CORS_ORIGIN == "*" ? true : process.env.CORS_ORIGIN;
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
}));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const body_parser_1 = __importDefault(require("body-parser"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
app.use((0, cookie_parser_1.default)());
const connect_config_1 = require("./config/connect.config");
(0, connect_config_1.connectToDatabase)();
const index_route_1 = __importDefault(require("./route/admin/index.route"));
(0, index_route_1.default)(app);
const index_route_2 = __importDefault(require("./route/client/index.route"));
(0, index_route_2.default)(app);
const port = +process.env.PORT;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
