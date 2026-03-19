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
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../helper");
/**
 * authMiddleware:
 * - reads JWT from cookie 'token' or Authorization: Bearer <token>
 * - verifies token and attaches req.user = { id, role }
 *
 * NOTE: this version expects the token payload shape signed by your generateToken:
 *   jwt.sign({ id, role }, ...)
 * where role can be an object (IRole) or a string.
 */
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = (req.header("Authorization")
            ? req.header("Authorization").split(" ")[1]
            : undefined) ||
            ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token);
        if (!token) {
            (0, helper_1.apiError)(res, 401, "Unauthorized: token missing");
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET not set in environment");
            (0, helper_1.apiError)(res, 500, "Server misconfiguration");
            return;
        }
        // Expect payload shape: { id: string, role: object|string, iat, exp }
        const payload = jsonwebtoken_1.default.verify(token, secret);
        if (!payload || !payload.id) {
            (0, helper_1.apiError)(res, 401, "Invalid token");
            return;
        }
        // role in token might be an object (role doc) or a string — normalize to role name string
        let roleName = "user";
        if (payload.role) {
            if (typeof payload.role === "string") {
                roleName = payload.role;
            }
            else if (typeof payload.role === "object" && payload.role.name) {
                roleName = payload.role.name;
            }
            else {
                // fallback: stringify whatever is present
                roleName = String(payload.role);
            }
        }
        req.user = { id: payload.id, role: roleName };
        next();
    }
    catch (err) {
        (0, helper_1.apiError)(res, 401, "Unauthorized", (_b = err.message) !== null && _b !== void 0 ? _b : err);
    }
});
exports.authMiddleware = authMiddleware;
