// scripts/seedRoles.ts
import mongoose from "mongoose";
import Permission from "../models/permission.model";
import Role from "../models/role.model";
import { MONGODB_URI } from "../constants";

const MONGO = MONGODB_URI;

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
    { name: "CREATE_ORG_EMP", description: "Create org or emp accounts" },
    {
        name: "CREATE_ADMIN",
        description: "Create admin account (super-admin only)",
    },

    // Optional catch-all (not required if you use the explicit list above)
    // { name: "MANAGE_ROLES", description: "Manage role definitions" },
];

/**
 * Role -> permissions mapping using permission names above.
 */
const ROLES: Array<{
    name: string;
    permissions: string[];
    description?: string;
}> = [
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
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
            "CREATE_ORG_EMP",
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
            "GET_PROFILE_SELF",
            "UPDATE_PROFILE_SELF",
            "DELETE_PROFILE_SELF",
            "CREATE_ORG_EMP",
        ],
        description: "Super admin",
    },
];

async function ensurePermissions() {
    const map: Record<string, mongoose.Types.ObjectId> = {};
    for (const p of PERMISSIONS) {
        const doc = await Permission.findOneAndUpdate(
            { name: p.name },
            { $setOnInsert: p },
            { upsert: true, new: true }
        ).exec();
        map[p.name] = doc._id as mongoose.Types.ObjectId;
        console.log(`Permission ensured: ${p.name} (${doc._id})`);
    }
    return map;
}

async function ensureRoles(
    permissionMap: Record<string, mongoose.Types.ObjectId>
) {
    for (const r of ROLES) {
        const permIds = r.permissions
            .map((pn) => permissionMap[pn])
            .filter(Boolean) as mongoose.Types.ObjectId[];

        // Upsert role and set permissions to permIds (overwrite to ensure exact mapping).
        const doc = await Role.findOneAndUpdate(
            { name: r.name },
            {
                $set: {
                    description: r.description ?? "",
                    permissions: permIds,
                },
                $setOnInsert: { name: r.name },
            },
            { upsert: true, new: true }
        ).exec();

        console.log(
            `Role ensured: ${r.name} (${
                doc._id
            }) - permissions: [${r.permissions.join(", ")}]`
        );
    }
}

async function seed() {
    await mongoose.connect(MONGO, {});

    try {
        const permissionMap = await ensurePermissions();
        await ensureRoles(permissionMap);
        console.log("Seeding completed.");
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();
