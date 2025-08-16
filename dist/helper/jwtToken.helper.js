"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.genRefreshToken = exports.genAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const genAccessToken = (id, type) => {
    const accessToken = jsonwebtoken_1.default.sign({ id, type }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE });
    return accessToken;
};
exports.genAccessToken = genAccessToken;
const genRefreshToken = (id, type) => {
    const refreshToken = jsonwebtoken_1.default.sign({ id, type }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRE });
    return refreshToken;
};
exports.genRefreshToken = genRefreshToken;
const verifyToken = (token, type) => {
    try {
        const secretKey = type === "access" ? process.env.ACCESS_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
            decoded.expired = true;
        }
        else {
            decoded.expired = false;
        }
        return decoded;
    }
    catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
};
exports.verifyToken = verifyToken;
