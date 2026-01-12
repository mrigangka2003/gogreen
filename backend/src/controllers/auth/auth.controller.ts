// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../../models/user.model";
import Role, { IRole, RoleName } from "../../models/role.model";
import { apiError, apiResponse } from "../../helper";
import { hashPassword, generateToken } from "../../utils";
import { registerSchema, loginSchema } from "../../validator/auth.validator";

/**
 * Helper: resolve role doc from input.
 */
async function resolveRole(roleInput?: string | null): Promise<IRole | null> {
    if (!roleInput) return Role.findOne({ name: "user" }).exec();
    if (mongoose.Types.ObjectId.isValid(roleInput))
        return Role.findById(roleInput).exec();
    return Role.findOne({ name: roleInput }).exec();
}

/**
 * Helper: ensure plain role object for JWT
 */
function sanitizeRole(role: IRole): IRole {
    return (role as any)?.toObject?.() ?? role;
}

/**
 * Register (public user or admin creating with role override)
 */
const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            apiError(res, 422, "Invalid payload", parsed.error.format());
            return;
        }

        const {
            name,
            email,
            password,
            phone,
            role: requestedRole,
        } = parsed.data;

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            apiError(res, 400, "User already exists with this email");
            return;
        }

        let roleDoc: IRole | null;
        const actor = req.user;

        if (actor?.role === "admin" && requestedRole) {
            roleDoc = await resolveRole(requestedRole);
            if (!roleDoc) {
                apiError(res, 400, "Requested role not found");
                return;
            }
        } else {
            roleDoc = await Role.findOne({ name: "user" }).exec();
            if (!roleDoc) {
                apiError(res, 500, "Default role 'user' not configured");
                return;
            }
        }

        const hashed = await hashPassword(password);

        const created = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });

        const populated = await created.populate<{ role: IRole }>("role");
        const roleObj = sanitizeRole(populated.role as IRole);

        const permissions: string[] = Array.isArray(
            (roleObj as any).permissions
        )
            ? (roleObj as any).permissions
            : [];

        //@ts-ignore
        const token = generateToken(created._id.toString(), roleObj);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        apiResponse(res, 201, "registered successfully", {
            token,
            user: {
                id: created._id,
                name: created.name,
                email: created.email,
                phone: created.phone,
                role: roleObj.name,
                permissions,
            },
        });
    } catch (err) {
        apiError(res, 500, "registration failed", err);
    }
};

/**
 * Admin creates a user with any role
 */
const adminCreateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            apiError(res, 403, "Forbidden");
            return;
        }

        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            apiError(res, 422, "Invalid payload", parsed.error.format());
            return;
        }

        const {
            name,
            email,
            password,
            phone,
            role: requestedRole,
        } = parsed.data;

        if (!requestedRole) {
            apiError(res, 400, "Role is required for admin user creation");
            return;
        }

        const roleDoc = await resolveRole(requestedRole);
        if (!roleDoc) {
            apiError(res, 400, "Requested role not found");
            return;
        }

        const existing = await User.findOne({ email }).lean();
        if (existing) {
            apiError(res, 400, "User already exists with this email");
            return;
        }

        const hashed = await hashPassword(password);
        const created = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });

        const populated = await created.populate<{ role: IRole }>("role");
        const roleObj = populated.role as IRole;

        apiResponse(res, 201, "User created by admin", {
            user: {
                id: created._id,
                name: created.name,
                email: created.email,
                role: roleObj.name,
            },
        });
    } catch (err) {
        apiError(res, 500, "admin create user failed", err);
    }
};

/**
 * Login
 */
const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            apiError(res, 422, "Invalid payload", parsed.error.format());
            return;
        }

        const { email, password } = parsed.data;

        const user = await User.findOne({ email })
            .select("+password")
            .populate<{ role: IRole }>("role");
        if (!user) {
            apiError(res, 401, "User not exists");
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            apiError(res, 401, "Invalid credentials---205");
            return;
        }

        const roleObj = sanitizeRole(user.role as IRole);

        const permissions: string[] = Array.isArray(
            (roleObj as any).permissions
        )
            ? (roleObj as any).permissions
            : [];

        //@ts-ignore
        const token = generateToken(user._id.toString(), roleObj);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        apiResponse(res, 200, "login successful", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: roleObj.name,
                permissions,
            },
        });
    } catch (err) {
        apiError(res, 500, "login failed", err);
    }
};

/**
 * Logout: clears cookie
 */
const logout = async (_req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        apiResponse(res, 200, "logged out", {});
    } catch (err) {
        apiError(res, 500, "logout failed", err);
    }
};

/**
 * Get current user (me)
 */
const me = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }
        const user = await User.findById(req.user.id).populate<{ role: IRole }>(
            "role"
        );
        if (!user) {
            apiError(res, 404, "User not found");
            return;
        }
        apiResponse(res, 200, "ok", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: (user as any).phone,
                role: (user.role as IRole).name,
            },
        });
    } catch (err) {
        apiError(res, 500, "get me failed", err);
    }
};

//only for development mode

export const adminRegister = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!role || !["admin", "super-admin"].includes(role)) {
            apiError(res, 400, "Role must be 'admin' or 'super-admin'");
            return;
        }

        // check if role exists
        const roleDoc = await Role.findOne({ name: role });
        if (!roleDoc) {
            apiError(
                res,
                400,
                `Role '${role}' not found. Run role seeder first.`
            );
            return;
        }

        // prevent duplicates
        const existing = await User.findOne({ email });
        if (existing) {
            apiError(res, 400, "User already exists with this email");
            return;
        }

        const hashed = await hashPassword(password);

        const created = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });

        const populated = await created.populate<{ role: IRole }>("role");
        const roleObj = sanitizeRole(populated.role as IRole);

        //@ts-ignore
        const token = generateToken(created._id.toString(), roleObj);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        apiResponse(res, 201, "registered successfully", {
            token,
            user: {
                id: created._id,
                name: created.name,
                email: created.email,
                phone: created.phone,
                role: roleObj.name,
            },
        });
    } catch (err) {
        apiError(res, 500, "quick privileged user creation failed", err);
    }
};

export default {
    register,
    adminCreateUser,
    login,
    logout,
    me,
    adminRegister,
};
