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
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_slug_generator_1 = __importDefault(require("mongoose-slug-generator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
mongoose_1.default.plugin(mongoose_slug_generator_1.default);
const userSchema = new mongoose_1.default.Schema({
    fullName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: false,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    songsLiked: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "song"
        }
    ],
    verifyArtist: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        required: false,
        default: ""
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", "unknown"],
        default: "unknown"
    },
    dateOfBirth: {
        type: Date,
        required: false,
        default: null
    },
    country: {
        type: String,
        required: false,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified('password')) {
            this.password = yield bcrypt_1.default.hash(this.password, 10);
        }
        next();
    });
});
exports.default = mongoose_1.default.model('user', userSchema, 'User');
