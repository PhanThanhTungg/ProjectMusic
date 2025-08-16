"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
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
const register = (req, res, next) => {
    const { email, fullName, password, confirmPassword } = req.body;
    if (!email) {
        const response = {
            message: "Email is required",
            error: "Bad Request"
        };
        return res.status(400).json(response);
    }
    if (!fullName) {
        const response = {
            message: "FullName is required",
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
    if (password !== confirmPassword) {
        const response = {
            message: "Passwords do not match",
            error: "Bad Request"
        };
        return res.status(400).json(response);
    }
    next();
};
exports.register = register;
