// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { apiError } from "../helper";

declare global {
    namespace Express {
        interface Request {
            user?: { id: string; role: string };
        }
    }
}

/**
 * authMiddleware:
 * - reads JWT from cookie 'token' or Authorization: Bearer <token>
 * - verifies token and attaches req.user = { id, role }
 *
 * NOTE: this version expects the token payload shape signed by your generateToken:
 *   jwt.sign({ id, role }, ...)
 * where role can be an object (IRole) or a string.
 */
export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const token =
            (req as any).cookies?.token ||
            (req.header("Authorization")
                ? req.header("Authorization")!.split(" ")[1]
                : undefined);

        if (!token) {
            apiError(res, 401, "Unauthorized: token missing");
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET not set in environment");
            apiError(res, 500, "Server misconfiguration");
            return;
        }

        // Expect payload shape: { id: string, role: object|string, iat, exp }
        const payload = jwt.verify(token, secret) as any;
        if (!payload || !payload.id) {
            apiError(res, 401, "Invalid token");
            return;
        }

        // role in token might be an object (role doc) or a string — normalize to role name string
        let roleName: string = "user";
        if (payload.role) {
            if (typeof payload.role === "string") {
                roleName = payload.role;
            } else if (typeof payload.role === "object" && payload.role.name) {
                roleName = payload.role.name;
            } else {
                // fallback: stringify whatever is present
                roleName = String(payload.role);
            }
        }

        req.user = { id: payload.id, role: roleName };
        next();
    } catch (err: any) {
        apiError(res, 401, "Unauthorized", err.message ?? err);
    }
};
