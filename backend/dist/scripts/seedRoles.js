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
// scripts/seedRoles.ts
const mongoose_1 = __importDefault(require("mongoose"));
const permission_model_1 = __importDefault(require("../models/permission.model"));
const role_model_1 = __importDefault(require("../models/role.model"));
const constants_1 = require("../constants");
const MONGO = `${constants_1.MONGODB_URI}/${constants_1.DB_NAME}`;
/**
 * Permissions (unique codes) — taken from the list you provided.
 * Each permission has `name` (the unique code) and an optional description.
 */
const PERMISSIONS = [
    // User / Org (same permissions)
    { name: "CREATE_BOOKING", description: "Create a booking" },
    { name: "UPDATE_BOOKING", description: "Update a booking" },
    { name: "CREATE_REVIEW_SELF", description: "Create own review" },
    { name: "UPDATE_REVIEW_SELF", description: "Update own review" },
    { name: "DELETE_REVIEW_SELF", description: "Delete own review" },
    { name: "GET_PROFILE_SELF", description: "Get own profile" },
    { name: "UPDATE_PROFILE_SELF", description: "Update own profile" },
    { name: "DELETE_PROFILE_SELF", description: "Delete own profile" },
    // Emp
    { name: "GET_ASSIGNED_BOOKING", description: "Get assigned bookings" },
    { name: "UPDATE_BEFORE_PHOTO", description: "Upload update before photo" },
    { name: "UPDATE_AFTER_PHOTO", description: "Upload update after photo" },
    {
        name: "GET_ASSIGNED_BOOKING_DETAILS",
        description: "Get assigned booking details",
    },
    {
        name: "GET_ASSIGNED_BOOKING_REVIEW",
        description: "Get review for assigned booking",
    },
    // Admin & Super Admin
    { name: "GET_ALL_ACCOUNTS", description: "Get all users/org/emp accounts" },
    {
        name: "GET_BOOKING_HISTORY",
        description: "Get booking history for users/org",
    },
    { name: "DELETE_ACCOUNT", description: "Delete user/org/emp account" },
    {
        name: "UPDATE_ASSIGN_BOOKING",
        description: "Assign or update a booking assignment",
    },
    { name: "VIEW_ALL_REVIEWS", description: "View all reviews" },
    { name: "VIEW_ALL_BOOKINGS", description: "View all bookings (admin/super-admin)" },
    { name: "CREATE_ORG_EMP", description: "Create org or emp accounts" },
    {
        name: "CREATE_ADMIN",
        description: "Create admin account (super-admin only)",
    },
    {
        name: "MANAGE_SERVICES",
        description: "Create, update, and delete services",
    },
    // Optional catch-all (not required if you use the explicit list above)
    // { name: "MANAGE_ROLES", description: "Manage role definitions" },
];
/**
 * Role -> permissions mapping using permission names above.
 */
const ROLES = [
    {
        name: "user",
        permissions: [
            "CREATE_BOOKING",
            "UPDATE_BOOKING",
            "CREATE_REVIEW_SELF",
            "UPDATE_REVIEW_SELF",
            "DELETE_REVIEW_SELF",
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
        ],
        description: "Default end-user",
    },
    {
        name: "org",
        permissions: [
            "CREATE_BOOKING",
            "UPDATE_BOOKING",
            "CREATE_REVIEW_SELF",
            "UPDATE_REVIEW_SELF",
            "DELETE_REVIEW_SELF",
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
        ],
        description: "Organization account (same as user)",
    },
    {
        name: "emp",
        permissions: [
            "GET_ASSIGNED_BOOKING",
            "UPDATE_BEFORE_PHOTO",
            "UPDATE_AFTER_PHOTO",
            "GET_ASSIGNED_BOOKING_DETAILS",
            "GET_ASSIGNED_BOOKING_REVIEW",
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
        ],
        description: "Employee account",
    },
    {
        name: "admin",
        permissions: [
            "GET_ALL_ACCOUNTS",
            "GET_BOOKING_HISTORY",
            "DELETE_ACCOUNT",
            "UPDATE_ASSIGN_BOOKING",
            "VIEW_ALL_REVIEWS",
            "VIEW_ALL_BOOKINGS",
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
            "CREATE_ORG_EMP",
            "MANAGE_SERVICES",
        ],
        description: "Admin user",
    },
    {
        name: "super-admin",
        permissions: [
            "GET_ALL_ACCOUNTS",
            "GET_BOOKING_HISTORY",
            "DELETE_ACCOUNT",
            "CREATE_ADMIN",
            "UPDATE_ASSIGN_BOOKING",
            "VIEW_ALL_REVIEWS",
            "VIEW_ALL_BOOKINGS",
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
            "CREATE_ORG_EMP",
            "MANAGE_SERVICES",
        ],
        description: "Super admin",
    },
];
function ensurePermissions() {
    return __awaiter(this, void 0, void 0, function* () {
        const map = {};
        for (const p of PERMISSIONS) {
            const doc = yield permission_model_1.default.findOneAndUpdate({ name: p.name }, { $setOnInsert: p }, { upsert: true, new: true }).exec();
            map[p.name] = doc._id;
            console.log(`Permission ensured: ${p.name} (${doc._id})`);
        }
        return map;
    });
}
function ensureRoles(permissionMap) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        for (const r of ROLES) {
            const permIds = r.permissions
                .map((pn) => permissionMap[pn])
                .filter(Boolean);
            // Upsert role and set permissions to permIds (overwrite to ensure exact mapping).
            const doc = yield role_model_1.default.findOneAndUpdate({ name: r.name }, {
                $set: {
                    description: (_a = r.description) !== null && _a !== void 0 ? _a : "",
                    permissions: permIds,
                },
                $setOnInsert: { name: r.name },
            }, { upsert: true, new: true }).exec();
            console.log(`Role ensured: ${r.name} (${doc._id}) - permissions: [${r.permissions.join(", ")}]`);
        }
    });
}
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(MONGO, {});
        try {
            const permissionMap = yield ensurePermissions();
            yield ensureRoles(permissionMap);
            console.log("Seeding completed.");
        }
        catch (err) {
            console.error("Seeding failed:", err);
            process.exitCode = 1;
        }
        finally {
            yield mongoose_1.default.disconnect();
        }
    });
}
seed();
