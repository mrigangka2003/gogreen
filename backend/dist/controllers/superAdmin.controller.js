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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const helper_1 = require("../helper");
const utils_1 = require("../utils");
/**
 * Get all accounts (user/org/emp/admin)
 */
const getAllAccounts = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield models_1.User.find().populate("role", "name");
        (0, helper_1.apiResponse)(res, 200, "All accounts fetched", accounts);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch accounts", err);
    }
});
/**
 * Get booking history of a specific account
 */
const getBookingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const bookings = yield models_1.Booking.find({ userId }).sort({ date: -1 });
        (0, helper_1.apiResponse)(res, 200, "Booking history fetched", bookings);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch booking history", err);
    }
});
/**
 * Delete account (any role)
 */
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield models_1.User.findByIdAndDelete(id);
        if (!deleted) {
            (0, helper_1.apiError)(res, 404, "Account not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Account deleted successfully", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to delete account", err);
    }
});
/**
 * Create an admin account
 */
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone } = req.body;
        const roleDoc = yield models_1.Role.findOne({ name: "admin" });
        if (!roleDoc) {
            (0, helper_1.apiError)(res, 500, "Admin role not configured");
            return;
        }
        const existing = yield models_1.User.findOne({ email }).lean();
        if (existing) {
            (0, helper_1.apiError)(res, 400, "User already exists with this email");
            return;
        }
        const hashed = yield (0, utils_1.hashPassword)(password);
        const created = yield models_1.User.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });
        (0, helper_1.apiResponse)(res, 201, "Admin account created", {
            id: created._id,
            name: created.name,
            email: created.email,
            role: "admin",
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create admin", err);
    }
});
/**
 * Create a super-admin account (only callable by existing super-admin)
 */
const createSuperAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone } = req.body;
        const roleDoc = yield models_1.Role.findOne({ name: "super-admin" });
        if (!roleDoc) {
            (0, helper_1.apiError)(res, 500, "Super-admin role not configured");
            return;
        }
        const existing = yield models_1.User.findOne({ email }).lean();
        if (existing) {
            (0, helper_1.apiError)(res, 400, "User already exists with this email");
            return;
        }
        const hashed = yield (0, utils_1.hashPassword)(password);
        const created = yield models_1.User.create({
            name,
            email,
            password: hashed,
            phone,
            role: roleDoc._id,
        });
        (0, helper_1.apiResponse)(res, 201, "Super-admin account created", {
            id: created._id,
            name: created.name,
            email: created.email,
            role: "super-admin",
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create super-admin", err);
    }
});
/**
 * Update an account (Super Admin can update everyone)
 */
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, phone, roleName } = req.body;
        const user = yield models_1.User.findById(id).populate("role");
        if (!user) {
            (0, helper_1.apiError)(res, 404, "Account not found");
            return;
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (phone !== undefined)
            user.phone = phone;
        if (roleName) {
            const roleDoc = yield models_1.Role.findOne({ name: roleName });
            if (!roleDoc) {
                (0, helper_1.apiError)(res, 400, "Invalid role specified");
                return;
            }
            if (roleName === "super-admin") {
                (0, helper_1.apiError)(res, 403, "Cannot change role to super-admin");
                return;
            }
            user.role = roleDoc._id;
        }
        yield user.save();
        (0, helper_1.apiResponse)(res, 200, "Account updated successfully", {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
        });
    }
    catch (error) {
        if (error.code === 11000) {
            (0, helper_1.apiError)(res, 400, "Email already exists");
            return;
        }
        (0, helper_1.apiError)(res, 500, error.message || "Failed to update account");
    }
});
/**
 * Get all bookings (sorted: latest → oldest)
 * Supports optional filters via query params
 */
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, userId, employeeId, startDate, endDate } = req.query;
        // Build dynamic filter object
        const filter = {};
        if (status)
            filter.status = status;
        if (userId)
            filter.userId = userId;
        if (employeeId)
            filter["assignments.employeeId"] = employeeId;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        // Sort newest → oldest using createdAt
        const bookings = yield models_1.Booking.find(filter)
            .populate("userId", "name email phone")
            .populate("assignments.employeeId", "name email phone")
            .sort({ createdAt: -1 }); // 👈 newest first
        (0, helper_1.apiResponse)(res, 200, "Bookings fetched successfully", bookings);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch bookings", err);
    }
});
/**
 * Assign booking to an employee
 */
const updateAssignBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, employeeIds } = req.body;
        const booking = yield models_1.Booking.findById(bookingId);
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        let empIdsArray = [];
        if (Array.isArray(employeeIds)) {
            empIdsArray = employeeIds;
        }
        else if (req.body.employeeId) {
            empIdsArray = [req.body.employeeId];
        }
        const employees = yield models_1.User.find({
            _id: { $in: empIdsArray },
        }).populate("role");
        for (const emp of employees) {
            if (emp.role.name !== "emp") {
                (0, helper_1.apiError)(res, 400, `Invalid employee ID: ${emp._id}`);
                return;
            }
        }
        const currentIds = (booking.assignments || [])
            .filter((a) => a.status !== "removed")
            .map((a) => a.employeeId.toString());
        const newAssignments = empIdsArray
            .filter((id) => !currentIds.includes(id))
            .map((id) => ({
            employeeId: new mongoose_1.Types.ObjectId(id),
            status: "assigned",
            assignedAt: new Date(),
        }));
        if (!booking.assignments)
            booking.assignments = [];
        booking.assignments.push(...newAssignments);
        booking.status = "assigned";
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Booking assigned successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to assign booking", err);
    }
});
/**
 * View all reviews
 */
const viewAllReviews = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield models_1.Review.find().populate("bookingId userId");
        (0, helper_1.apiResponse)(res, 200, "All reviews fetched", reviews);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch reviews", err);
    }
});
/**
 * Get own profile
 */
const getProfileSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const user = yield models_1.User.findById(req.user.id).select("-password");
        if (!user) {
            (0, helper_1.apiError)(res, 404, "User not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Profile fetched successfully", user);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch profile", err);
    }
});
/**
 * Update own profile
 */
const updateProfileSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const updated = yield models_1.User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true,
        }).select("-password");
        (0, helper_1.apiResponse)(res, 200, "Profile updated successfully", updated);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update profile", err);
    }
});
/**
 * Delete own profile
 */
const deleteProfileSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        yield models_1.User.findByIdAndDelete(req.user.id);
        (0, helper_1.apiResponse)(res, 200, "Profile deleted successfully", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to delete profile", err);
    }
});
/** Remove if not needed
 * Update user role (e.g. user to org, or user to emp)
 */
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { roleName } = req.body;
        if (!["org", "emp"].includes(roleName)) {
            (0, helper_1.apiError)(res, 400, "Target role must be 'org' or 'emp'");
            return;
        }
        const roleDoc = yield models_1.Role.findOne({ name: roleName });
        if (!roleDoc) {
            (0, helper_1.apiError)(res, 500, `Role '${roleName}' not found in system`);
            return;
        }
        const user = yield models_1.User.findById(userId);
        if (!user) {
            (0, helper_1.apiError)(res, 404, "User not found");
            return;
        }
        user.role = roleDoc._id;
        yield user.save();
        (0, helper_1.apiResponse)(res, 200, `User role updated to ${roleName} successfully`, {
            id: user._id,
            name: user.name,
            email: user.email,
            role: roleName,
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update user role", err);
    }
});
exports.default = {
    getAllAccounts,
    updateAccount,
    getBookingHistory,
    getAllBookings,
    deleteAccount,
    createAdmin,
    createSuperAdmin,
    updateAssignBooking,
    updateUserRole,
    viewAllReviews,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
