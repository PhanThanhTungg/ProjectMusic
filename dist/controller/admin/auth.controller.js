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
exports.refreshToken = exports.login = void 0;
const admin_model_1 = __importDefault(require("../../model/admin.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwtToken_helper_1 = require("../../helper/jwtToken.helper");
const httpOnly_helper_1 = require("../../helper/httpOnly.helper");
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const admin = yield admin_model_1.default.findOne({ email });
        if (!admin) {
            const response = {
                message: "Email not found"
            };
            return res.status(404).json(response);
        }
        if (!bcrypt_1.default.compareSync(password, admin.password)) {
            const response = {
                message: "Incorrect password"
            };
            return res.status(401).json(response);
        }
        const accessToken = (0, jwtToken_helper_1.genAccessToken)(admin._id.toString(), "admin");
        const refreshToken = (0, jwtToken_helper_1.genRefreshToken)(admin._id.toString(), "admin");
        (0, httpOnly_helper_1.saveCookie)(res, "adminRefreshToken", refreshToken);
        const response = {
            message: "Login successful",
            accessToken,
            user: {
                type: "admin",
                id: admin._id.toString(),
                avatar: admin.avatar,
                name: admin.name,
                phone: admin.phone,
                email: admin.email,
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
        const refreshToken = req.cookies["adminRefreshToken"];
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
        const adminId = refreshTokenDecoded["id"];
        const type = refreshTokenDecoded["type"];
        if (!adminId) {
            const response = {
                message: "Invalid refresh token",
                error: "Forbidden"
            };
            return res.status(403).json(response);
        }
        if (type !== "admin") {
            const response = {
                message: "Invalid token type",
                error: "Forbidden"
            };
            return res.status(403).json(response);
        }
        const admin = yield admin_model_1.default.findOne({ _id: adminId });
        if (!admin) {
            const response = {
                message: "Admin not found",
                error: "Not Found"
            };
            return res.status(404).json(response);
        }
        const newAccessToken = (0, jwtToken_helper_1.genAccessToken)(admin._id.toString(), "admin");
        const newRefreshToken = (0, jwtToken_helper_1.genRefreshToken)(admin._id.toString(), "admin");
        (0, httpOnly_helper_1.saveCookie)(res, "adminRefreshToken", newRefreshToken);
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
