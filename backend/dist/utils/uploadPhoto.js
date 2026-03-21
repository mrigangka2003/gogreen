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
exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
/**
 * Upload a base64-encoded image to Cloudinary.
 * @param base64 - The full data-URI string (e.g. "data:image/png;base64,...")
 * @param folder - Cloudinary folder path
 * @returns The secure URL of the uploaded image
 */
const uploadToCloudinary = (base64_1, ...args_1) => __awaiter(void 0, [base64_1, ...args_1], void 0, function* (base64, folder = "gogreen/reference-photos") {
    const result = yield cloudinary_1.default.uploader.upload(base64, {
        folder,
        resource_type: "image",
        transformation: [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
        ],
    });
    return result.secure_url;
});
exports.uploadToCloudinary = uploadToCloudinary;
