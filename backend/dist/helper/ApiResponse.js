"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponse = void 0;
const apiResponse = (res, statusCode, message, data = {}) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.apiResponse = apiResponse;
