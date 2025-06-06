"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCookie = void 0;
const saveCookie = (res, type, token) => {
    res.cookie(type, token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: +process.env.COOKIE_HTTP_ONLY_EXPIRE * 24 * 60 * 60 * 1000,
        path: "/"
    });
};
exports.saveCookie = saveCookie;
