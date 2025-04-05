"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_generator_1 = __importDefault(require("mongoose-slug-generator"));
mongoose_1.default.plugin(mongoose_slug_generator_1.default);
const songSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    thumbnail: String,
    background: String,
    description: String,
    lyrics: String,
    audio: {
        type: String,
        required: true
    },
    like: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        slug: "title"
    },
    status: {
        type: String,
        default: "active",
        enum: ["active", "inactive"]
    },
    deleted: {
        type: Boolean,
        default: false
    },
    idAdmin: String,
    idSinger: String,
    idAlbum: String
}, { timestamps: true });
exports.default = mongoose_1.default.model('song', songSchema, 'Song');
