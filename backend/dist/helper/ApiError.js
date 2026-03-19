"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiError = void 0;
const apiError = (res, statusCode, message, error) => {
    console.error(" Error:", message, error || "");
    return res.status(statusCode).json({
        success: false,
        message,
        error: (error === null || error === void 0 ? void 0 : error.message) || undefined,
    });
};
exports.apiError = apiError;
