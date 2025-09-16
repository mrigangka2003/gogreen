// src/middleware/rbac.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import { apiError } from "../helper";

/**
 * requireRole(...allowedRoles)
 * - simple middleware that checks req.user.role is in allowedRoles
 */
export const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            apiError(res, 403, "Forbidden: insufficient role");
            return;
        }
        next();
    };
};

/**
 * requirePermissions(...permissionNames)
 * - loads the user's role (and its permissions) from DB and checks the required permissions exist
 * - bypass for role 'super-admin'
 *
 * Usage: app.post('/resource', authMiddleware, requirePermissions('booking.assign'), handler)
 */
export const requirePermissions = (...permissionNames: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                apiError(res, 401, "Unauthorized");
                return;
            }

            // load user with populated role->permissions
            // This populates role and role.permissions (if role.permissions refs Permission)
            const user = await User.findById(req.user.id).populate<{
                role: any;
            }>({
                path: "role",
                populate: { path: "permissions" },
            });

            if (!user || !user.role) {
                apiError(res, 403, "Forbidden");
                return;
            }

            const role = user.role as any;
            const roleName = role.name ?? req.user.role;

            // super-admin bypass
            if (roleName === "super-admin") {
                return next();
            }

            // role.permissions should now be array of Permission docs (populated)
            const permsInRole: string[] = Array.isArray(role.permissions)
                ? role.permissions.map((p: any) => p.name).filter(Boolean)
                : [];

            const missing = permissionNames.filter(
                (p) => !permsInRole.includes(p)
            );
            if (missing.length > 0) {
                apiError(
                    res,
                    403,
                    `Forbidden: missing permissions [${missing.join(", ")}]`
                );
                return;
            }

            next();
        } catch (err) {
            console.error("requirePermissions error:", err);
            apiError(res, 500, "Server error", err);
        }
    };
};
