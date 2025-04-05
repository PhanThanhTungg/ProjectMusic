"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genre_route_1 = __importDefault(require("./genre.route"));
const song_route_1 = __importDefault(require("./song.route"));
const system_1 = __importDefault(require("../../config/system"));
exports.default = (app) => {
    app.use(`/${system_1.default.prefixAdmin}/genre`, genre_route_1.default);
    app.use(`/${system_1.default.prefixAdmin}/song`, song_route_1.default);
};
