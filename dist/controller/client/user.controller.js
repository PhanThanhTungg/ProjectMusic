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
exports.getUser = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtToken_helper_1 = require("../../helper/jwtToken.helper");
const httpOnly_helper_1 = require("../../helper/httpOnly.helper");
const user_model_1 = __importDefault(require("../../model/user.model"));
const resError_helper_1 = require("../../helper/resError.helper");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, fullName, password } = req.body;
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            const response = {
                message: "Email already exists",
                error: "Conflict"
            };
            return res.status(409).json(response);
        }
        const newUser = new user_model_1.default({
            email,
            fullName,
            password
        });
        yield newUser.save();
        const response = {
            message: "User registered successfully"
        };
        return res.status(201).json(response);
    }
    catch (error) {
        const response = {
            message: "Internal server error",
            error: error
        };
        return res.status(500).json(response);
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            const response = {
                message: "Email not found"
            };
            return res.status(404).json(response);
        }
        if (!bcrypt_1.default.compareSync(password, user.password)) {
            const response = {
                message: "Incorrect password"
            };
            return res.status(401).json(response);
        }
        const accessToken = (0, jwtToken_helper_1.genAccessToken)(user._id.toString(), "user");
        const refreshToken = (0, jwtToken_helper_1.genRefreshToken)(user._id.toString(), "user");
        (0, httpOnly_helper_1.saveCookie)(res, "userRefreshToken", refreshToken);
        const response = {
            message: "Login successful",
            accessToken,
            user: {
                type: "user",
                id: user._id.toString(),
                avatar: user.avatar,
                fullName: user.fullName,
                email: user.email,
            }
        };
        return res.status(200).json(response);
    }
    catch (error) {
        const response = {
            message: "Internal server error",
            error: error
        };
        return res.status(500).json(response);
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies["userRefreshToken"];
        if (!refreshToken) {
            const response = {
                message: "No refresh token provided",
                error: "Unauthorized"
            };
            return res.status(401).json(response);
        }
        const refreshTokenDecoded = (0, jwtToken_helper_1.verifyToken)(refreshToken, "refresh");
        if (!refreshTokenDecoded) {
            const response = {
                message: "Invalid refresh token",
                error: "Forbidden"
            };
            return res.status(403).json(response);
        }
        if (refreshTokenDecoded.expired == true) {
            const response = {
                message: "Refresh token expired",
                error: "Forbidden"
            };
            return res.status(403).json(response);
        }
        const userId = refreshTokenDecoded["id"];
        const type = refreshTokenDecoded["type"];
        if (!userId) {
            const response = {
                message: "Invalid refresh token",
                error: "Forbidden"
            };
            return res.status(403).json(response);
        }
        if (type !== "user") {
            const response = {
                message: "Invalid token type",
                error: "Forbidden"
            };
            return res.status(403).json(response);
        }
        const user = yield user_model_1.default.findOne({ _id: userId });
        if (!user) {
            const response = {
                message: "User not found",
                error: "Not Found"
            };
            return res.status(404).json(response);
        }
        const newAccessToken = (0, jwtToken_helper_1.genAccessToken)(user._id.toString(), "user");
        const newRefreshToken = (0, jwtToken_helper_1.genRefreshToken)(user._id.toString(), "user");
        (0, httpOnly_helper_1.saveCookie)(res, "userRefreshToken", newRefreshToken);
        const response = {
            message: "Access token refreshed successfully",
            accessToken: newAccessToken
        };
        return res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        const response = {
            message: "Internal server error",
            error: error
        };
        return res.status(500).json(response);
    }
});
exports.refreshToken = refreshToken;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findOne({ _id: id, deleted: false, status: "active" })
            .select("-password -deleted -status -updatedAt");
        if (!user) {
            return (0, resError_helper_1.resError1)(new Error("User not found"), "User not found", res, 404);
        }
        const response = {
            message: "User found",
            user: user
        };
        return res.status(200).json(response);
    }
    catch (error) {
        return (0, resError_helper_1.resError1)(error, "Internal server error", res);
    }
});
exports.getUser = getUser;
