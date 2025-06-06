"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPOST = void 0;
const createPOST = (req, res, next) => {
    if (!req.body.title) {
        const response = {
            message: "Please enter a title"
        };
        res.status(400).json(response);
        return;
    }
    next();
};
exports.createPOST = createPOST;
