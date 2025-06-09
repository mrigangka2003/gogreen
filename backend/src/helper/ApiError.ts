import { Response } from "express";

export const apiError = (
    res: Response,
    statusCode: number,
    message: string,
    error?: any
) => {
    console.error(" Error:", message, error || "");
    return res.status(statusCode).json({
        success: false,
        message,
        error: error?.message || undefined,
    });
};
