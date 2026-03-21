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
exports.adminRegister = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const role_model_1 = __importDefault(require("../../models/role.model"));
const helper_1 = require("../../helper");
const utils_1 = require("../../utils");
const auth_validator_1 = require("../../validator/auth.validator");
/**
 * Helper: resolve role doc from input.
 */
function resolveRole(roleInput) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!roleInput)
            return role_model_1.default.findOne({ name: "user" }).exec();
        if (mongoose_1.default.Types.ObjectId.isValid(roleInput))
            return role_model_1.default.findById(roleInput).exec();
        return role_model_1.default.findOne({ name: roleInput }).exec();
    });
}
/**
 * Helper: ensure plain role object for JWT
 */
function sanitizeRole(role) {
    var _a, _b;
    return (_b = (_a = role === null || role === void 0 ? void 0 : role.toObject) === null || _a === void 0 ? void 0 : _a.call(role)) !== null && _b !== void 0 ? _b : role;
}
/**
 * Register (public user or admin creating with role override)
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = auth_validator_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, helper_1.apiError)(res, 422, "Invalid payload", parsed.error.format());
            return;
        }
        const { name, email, password, phone, role: requestedRole, } = parsed.data;
        const existing = yield user_model_1.default.findOne({ email }).lean();
        if (existing) {
            (0, helper_1.apiError)(res, 400, "User already exists with this email");
            return;
        }
        let roleDoc;
        const actor = req.user;
        if ((actor === null || actor === void 0 ? void 0 : actor.role) === "admin" && requestedRole) {
            roleDoc = yield resolveRole(requestedRole);
            if (!roleDoc) {
                (0, helper_1.apiError)(res, 400, "Requested role not found");
                return;
            }
        }
        else {
            roleDoc = yield role_model_1.default.findOne({ name: "user" }).exec();
            if (!roleDoc) {
                (0, helper_1.apiError)(res, 500, "Default role 'user' not configured");
                return;
            }
        }
        const hashed = yield (0, utils_1.hashPassword)(password);
        const created = yield user_model_1.default.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });
        const populated = yield created.populate("role");
        const roleObj = sanitizeRole(populated.role);
        const permissions = Array.isArray(roleObj.permissions)
            ? roleObj.permissions
            : [];
        //@ts-ignore
        const token = (0, utils_1.generateToken)(created._id.toString(), roleObj);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        (0, helper_1.apiResponse)(res, 201, "registered successfully", {
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
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "registration failed", err);
    }
});
/**
 * Admin creates a user with any role
 */
const adminCreateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || req.user.role !== "admin") {
            (0, helper_1.apiError)(res, 403, "Forbidden");
            return;
        }
        const parsed = auth_validator_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, helper_1.apiError)(res, 422, "Invalid payload", parsed.error.format());
            return;
        }
        const { name, email, password, phone, role: requestedRole, } = parsed.data;
        if (!requestedRole) {
            (0, helper_1.apiError)(res, 400, "Role is required for admin user creation");
            return;
        }
        const roleDoc = yield resolveRole(requestedRole);
        if (!roleDoc) {
            (0, helper_1.apiError)(res, 400, "Requested role not found");
            return;
        }
        const existing = yield user_model_1.default.findOne({ email }).lean();
        if (existing) {
            (0, helper_1.apiError)(res, 400, "User already exists with this email");
            return;
        }
        const hashed = yield (0, utils_1.hashPassword)(password);
        const created = yield user_model_1.default.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });
        const populated = yield created.populate("role");
        const roleObj = populated.role;
        (0, helper_1.apiResponse)(res, 201, "User created by admin", {
            user: {
                id: created._id,
                name: created.name,
                email: created.email,
                role: roleObj.name,
            },
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "admin create user failed", err);
    }
});
/**
 * Login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = auth_validator_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, helper_1.apiError)(res, 422, "Invalid payload", parsed.error.format());
            return;
        }
        const { email, password } = parsed.data;
        const user = yield user_model_1.default.findOne({ email })
            .select("+password")
            .populate("role");
        if (!user) {
            (0, helper_1.apiError)(res, 401, "User not exists");
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            (0, helper_1.apiError)(res, 401, "Invalid credentials---205");
            return;
        }
        const roleObj = sanitizeRole(user.role);
        const permissions = Array.isArray(roleObj.permissions)
            ? roleObj.permissions
            : [];
        //@ts-ignore
        const token = (0, utils_1.generateToken)(user._id.toString(), roleObj);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        (0, helper_1.apiResponse)(res, 200, "login successful", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: roleObj.name,
                permissions,
            },
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "login failed", err);
    }
});
/**
 * Logout: clears cookie
 */
const logout = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        (0, helper_1.apiResponse)(res, 200, "logged out", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "logout failed", err);
    }
});
/**
 * Get current user (me)
 */
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const user = yield user_model_1.default.findById(req.user.id).populate("role");
        if (!user) {
            (0, helper_1.apiError)(res, 404, "User not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "ok", {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role.name,
            },
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "get me failed", err);
    }
});
//only for development mode
const adminRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!role || !["admin", "super-admin"].includes(role)) {
            (0, helper_1.apiError)(res, 400, "Role must be 'admin' or 'super-admin'");
            return;
        }
        // check if role exists
        const roleDoc = yield role_model_1.default.findOne({ name: role });
        if (!roleDoc) {
            (0, helper_1.apiError)(res, 400, `Role '${role}' not found. Run role seeder first.`);
            return;
        }
        // prevent duplicates
        const existing = yield user_model_1.default.findOne({ email });
        if (existing) {
            (0, helper_1.apiError)(res, 400, "User already exists with this email");
            return;
        }
        const hashed = yield (0, utils_1.hashPassword)(password);
        const created = yield user_model_1.default.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });
        const populated = yield created.populate("role");
        const roleObj = sanitizeRole(populated.role);
        //@ts-ignore
        const token = (0, utils_1.generateToken)(created._id.toString(), roleObj);
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        (0, helper_1.apiResponse)(res, 201, "registered successfully", {
            token,
            user: {
                id: created._id,
                name: created.name,
                email: created.email,
                phone: created.phone,
                role: roleObj.name,
            },
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "quick privileged user creation failed", err);
    }
});
exports.adminRegister = adminRegister;
exports.default = {
    register,
    adminCreateUser,
    login,
    logout,
    me,
    adminRegister: exports.adminRegister,
};
