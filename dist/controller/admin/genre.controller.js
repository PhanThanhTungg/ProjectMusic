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
exports.indexGET = exports.createPOST = void 0;
const genre_model_1 = __importDefault(require("../../model/genre.model"));
const pagination_helper_1 = __importDefault(require("../../helper/pagination.helper"));
const createPOST = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const genreData = {
            title: req.body.title,
            thumbnail: req.body.thumbnail,
            description: req.body.description
        };
        const genre = new genre_model_1.default(genreData);
        yield genre.save();
        res.json({
            code: 200,
            message: "create genre successfully",
            data: genre
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: error,
        });
    }
});
exports.createPOST = createPOST;
const indexGET = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const find = {
            deleted: false
        };
        if (req.query.status)
            find["status"] = req.query.status;
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[`${req.query.sortKey}`] = req.query.sortValue;
        }
        const currentPage = +req.query.page || 1;
        const limit = +req.query.limit || 8;
        const objectPagination = (0, pagination_helper_1.default)(currentPage, limit, yield genre_model_1.default.countDocuments(find));
        const genres = yield genre_model_1.default.find(find).sort(sort)
            .skip(objectPagination["skip"]).limit(objectPagination["limit"]);
        res.json({
            code: 200,
            data: genres,
            objectPagination: objectPagination
        });
    }
    catch (error) {
        res.json({
            code: 400,
            message: error,
        });
    }
});
exports.indexGET = indexGET;
