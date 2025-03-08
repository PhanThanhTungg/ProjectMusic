"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_generator_1 = __importDefault(require("mongoose-slug-generator"));
mongoose_1.default.plugin(mongoose_slug_generator_1.default);
const genreSchema = new mongoose_1.default.Schema({
    title: String,
    thumbnail: String,
    description: String,
    slug: {
        type: String,
        slug: "title"
    },
    status: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model('genre', genreSchema, 'Genre');
