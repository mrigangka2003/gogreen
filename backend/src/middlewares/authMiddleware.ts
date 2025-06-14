import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { apiError } from "../helper";
import { JWT_SECRET } from "../constants";

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies.token;

    if (!token) {
        apiError(res, 401, "No token provided. Unauthorized.");
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        apiError(res, 401, "Invalid or expired token", err);
        return;
    }
};

