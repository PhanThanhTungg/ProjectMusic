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
exports.deleteDELETE = exports.deletePATCH = exports.updatePATCH = exports.createPOST = exports.indexGET = void 0;
const song_model_1 = __importDefault(require("../../model/song.model"));
const resError_helper_1 = require("../../helper/resError.helper");
const indexGET = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const songs = yield song_model_1.default.find({
        status: "active",
        deleted: false
    });
    res.json({
        code: 200,
        data: songs
    });
});
exports.indexGET = indexGET;
const createPOST = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, thumbnail, background, description, lyrics, audio, } = req.body;
        const song = new song_model_1.default({ title, thumbnail, background, description, lyrics, audio });
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
const updatePATCH = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, thumbnail, background, description, lyrics, audio } = req.body;
        const song = yield song_model_1.default.findByIdAndUpdate(req.params.id, {
            title, thumbnail, background, description, lyrics, audio
        }, { new: true });
        res.json({
            code: 200,
            data: song
        });
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, res);
    }
});
exports.updatePATCH = updatePATCH;
const deletePATCH = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield song_model_1.default.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        res.json({
            code: 200,
        });
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, res);
    }
});
exports.deletePATCH = deletePATCH;
const deleteDELETE = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield song_model_1.default.findByIdAndDelete(req.params.id);
        res.json({
            code: 200
        });
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, res);
    }
});
exports.deleteDELETE = deleteDELETE;
