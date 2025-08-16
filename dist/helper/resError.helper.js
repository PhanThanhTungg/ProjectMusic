"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resError1 = void 0;
const resError1 = (error, message, res, statusCode = 500) => {
    console.log("Have error: " + error);
    const errorResponse = {
        message,
        error
    };
    res.status(statusCode).json(errorResponse);
};
exports.resError1 = resError1;
