"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const song_route_1 = __importDefault(require("./song.route"));
exports.default = (app) => {
    app.use("/song", song_route_1.default);
};
