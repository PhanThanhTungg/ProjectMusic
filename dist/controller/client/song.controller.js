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
exports.like = exports.getDetail = exports.getAll = void 0;
const song_model_1 = __importDefault(require("../../model/song.model"));
const resError_helper_1 = require("../../helper/resError.helper");
const user_model_1 = __importDefault(require("../../model/user.model"));
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const songs = yield song_model_1.default.find({
            status: "active",
            deleted: false
        });
        res.json({
            code: 200,
            data: songs
        });
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, "error", res);
    }
});
exports.getAll = getAll;
const getDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield song_model_1.default.findOne({
            slug: req.params.slug,
            status: "active",
            deleted: false
        });
        if (!song) {
            const response = {
                message: "Song not found"
            };
        }
        const response = {
            message: "Song found",
            data: song
        };
        res.status(200).json(response);
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, "error", res);
    }
});
exports.getDetail = getDetail;
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const song = yield song_model_1.default.findOne({
            slug: req.params.slug,
            status: "active",
            deleted: false
        });
        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }
        if (res.locals.user.songsLiked.includes(song._id)) {
            yield user_model_1.default.updateOne({
                _id: res.locals.user._id
            }, {
                $pull: { songsLiked: song._id }
            });
            const response = {
                message: "You unlike this song successfully",
            };
            return res.status(200).json(response);
        }
        yield user_model_1.default.updateOne({
            _id: res.locals.user._id
        }, {
            $push: { songsLiked: song._id }
        });
        const response = {
            message: "Song liked successfully"
        };
        res.status(200).json(response);
    }
    catch (error) {
        (0, resError_helper_1.resError1)(error, "error", res);
    }
});
exports.like = like;
