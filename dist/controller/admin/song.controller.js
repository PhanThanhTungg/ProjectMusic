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
exports.createPOST = void 0;
const song_model_1 = __importDefault(require("../../model/song.model"));
const resError_helper_1 = require("../../helper/resError.helper");
const createPOST = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = new song_model_1.default(req.body);
        yield song.save();
        res.json({
            code: 200,
            data: song
        });
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, res);
    }
});
exports.createPOST = createPOST;
