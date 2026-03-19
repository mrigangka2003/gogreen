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
exports.requirePermissions = exports.requireRole = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const helper_1 = require("../helper");
/**
 * requireRole(...allowedRoles)
 * - simple middleware that checks req.user.role is in allowedRoles
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            (0, helper_1.apiError)(res, 403, "Forbidden: insufficient role");
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * requirePermissions(...permissionNames)
 * - loads the user's role (and its permissions) from DB and checks the required permissions exist
 * - bypass for role 'super-admin'
 *
 * Usage: app.post('/resource', authMiddleware, requirePermissions('booking.assign'), handler)
 */
const requirePermissions = (...permissionNames) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            if (!req.user) {
                (0, helper_1.apiError)(res, 401, "Unauthorized");
                return;
            }
            // load user with populated role->permissions
            // This populates role and role.permissions (if role.permissions refs Permission)
            const user = yield user_model_1.default.findById(req.user.id).populate({
                path: "role",
                populate: { path: "permissions" },
            });
            if (!user || !user.role) {
                (0, helper_1.apiError)(res, 403, "Forbidden");
                return;
            }
            const role = user.role;
            const roleName = (_a = role.name) !== null && _a !== void 0 ? _a : req.user.role;
            // super-admin bypass
            if (roleName === "super-admin") {
                return next();
            }
            // role.permissions should now be array of Permission docs (populated)
            const permsInRole = Array.isArray(role.permissions)
                ? role.permissions.map((p) => p.name).filter(Boolean)
                : [];
            console.log("Permission Namess", permissionNames);
            console.log("Permissionssss", permsInRole);
            const missing = permissionNames.filter((p) => !permsInRole.includes(p));
            if (missing.length > 0) {
                (0, helper_1.apiError)(res, 403, `Forbidden: missing permissions [${missing.join(", ")}]`);
                return;
            }
            next();
        }
        catch (err) {
            console.error("requirePermissions error:", err);
            (0, helper_1.apiError)(res, 500, "Server error", err);
        }
    });
};
exports.requirePermissions = requirePermissions;
