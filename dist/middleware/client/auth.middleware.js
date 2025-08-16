"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAccessToken = void 0;
const jwtToken_helper_1 = require("../../helper/jwtToken.helper");
const user_model_1 = __importDefault(require("../../model/user.model"));
const authAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const bearerToken = req.headers["authorization"];
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
        const response = {
            error: "Unauthorized access",
            message: "No token provided or invalid token format. Please provide a valid Bearer token.",
        };
        return res.status(401).json(response);
    }
    const accessToken = bearerToken.split(" ")[1];
    if (!accessToken) {
        const response = {
            error: "Unauthorized access",
            message: "No token provided. Please provide a valid Bearer token.",
        };
        return res.status(401).json(response);
    }
    const tokenDecoded = (0, jwtToken_helper_1.verifyToken)(accessToken, "access");
    if (!tokenDecoded) {
        const response = {
            error: "Unauthorized access",
            message: "Invalid token. Please login again.",
        };
        return res.status(401).json(response);
    }
    if (tokenDecoded.type !== "user") {
        const response = {
            error: "Unauthorized access",
            message: "You are not authorized to access this resource.",
        };
        return res.status(403).json(response);
    }
    const userId = tokenDecoded.id;
    if (!userId) {
        const response = {
            error: "Unauthorized access",
            message: "Invalid token. User ID not found.",
        };
        return res.status(401).json(response);
    }
    const user = yield user_model_1.default.findOne({ _id: userId });
    if (!user) {
        const response = {
            error: "Unauthorized access",
            message: "User not found. Please login again.",
        };
        return res.status(401).json(response);
    }
    res.locals.user = user;
    console.log("tokenDecoded", tokenDecoded);
    next();
});
exports.authAccessToken = authAccessToken;
