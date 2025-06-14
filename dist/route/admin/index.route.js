"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genre_route_1 = __importDefault(require("./genre.route"));
const song_route_1 = __importDefault(require("./song.route"));
const auth_route_1 = __importDefault(require("./auth.route"));
const system_1 = __importDefault(require("../../config/system"));
const auth_middleware_1 = require("../../middleware/admin/auth.middleware");
exports.default = (app) => {
    app.use(`/${system_1.default.prefixAdmin}`, auth_route_1.default);
    app.use(`/${system_1.default.prefixAdmin}/genre`, auth_middleware_1.authAccessToken, genre_route_1.default);
    app.use(`/${system_1.default.prefixAdmin}/song`, auth_middleware_1.authAccessToken, song_route_1.default);
};
