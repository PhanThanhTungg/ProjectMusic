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
exports.uploadMutiple = exports.uploadSingle = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});
const streamUpload = (buffer) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        let stream = cloudinary_1.v2.uploader.upload_stream((error, result) => {
            if (result) {
                resolve(result);
            }
            else {
                reject(error);
            }
        });
        streamifier_1.default.createReadStream(buffer).pipe(stream);
    });
});
const uploadSingle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req["file"]) {
        function upload(req) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield streamUpload(req.file.buffer);
                req.body[req.file.fieldname] = result["secure_url"];
            });
        }
        yield upload(req);
    }
    next();
});
exports.uploadSingle = uploadSingle;
const uploadMutiple = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req["files"]) {
        for (const key of Object.keys(req["files"])) {
            let newArr = [];
            for (const item of req["files"][key]) {
                try {
                    const result = yield streamUpload(item.buffer);
                    newArr.push(result["url"]);
                }
                catch (error) {
                    console.log(error);
                }
            }
            req.body[key] = newArr;
        }
    }
    next();
});
exports.uploadMutiple = uploadMutiple;
