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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPOST = void 0;
const createPOST = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requiredFields = ["title", "audio"];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            res.json({
                code: "400",
                message: `Please enter a ${field}`
            });
            return;
        }
    }
    if (req.body.audio && !req.body.audio.startsWith("http")) {
        res.json({
            code: "400",
            message: "Audio must be a valid URL"
        });
        return;
    }
    if (req.body.thumbnail && !req.body.thumbnail.startsWith("http")) {
        res.json({
            code: "400",
            message: "Thumbnail must be a valid URL"
        });
        return;
    }
    if (req.body.background && !req.body.background.startsWith("http")) {
        res.json({
            code: "400",
            message: "Background must be a valid URL"
        });
        return;
    }
    next();
});
exports.createPOST = createPOST;
