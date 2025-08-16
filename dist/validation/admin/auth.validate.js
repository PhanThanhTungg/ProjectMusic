"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const login = (req, res, next) => {
    const { email, password } = req.body;
    if (!email) {
        const response = {
            message: "Email is required",
            error: "Bad Request"
        };
        return res.status(400).json(response);
    }
    if (!password) {
        const response = {
            message: "Password is required",
            error: "Bad Request"
        };
        return res.status(400).json(response);
    }
    next();
};
exports.login = login;
