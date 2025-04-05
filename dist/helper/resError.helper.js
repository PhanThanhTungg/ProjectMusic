"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resError1 = void 0;
const resError1 = (error, res) => {
    console.log("Have error: " + error);
    console.log(error);
    res.json({
        code: error.code || 400,
        message: error.message || "Error",
    });
};
exports.resError1 = resError1;
