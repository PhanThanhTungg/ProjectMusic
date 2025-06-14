"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resError1 = void 0;
const resError1 = (error, message, res) => {
    console.log("Have error: " + error);
    console.log(error);
    const errorResponse = {
        message,
        error
    };
    res.status(500).json(errorResponse);
};
exports.resError1 = resError1;
