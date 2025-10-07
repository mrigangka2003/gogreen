import { Request, Response } from "express";
import { User,Booking,Review,Role } from "../models";

import { apiError, apiResponse } from "../helper";
import { hashPassword } from "../utils";

/**
 * Get all accounts (user/org/emp/admin)
 */
const getAllAccounts = async (_req: Request, res: Response): Promise<void> => {
    try {
        const accounts = await User.find().populate("role", "name");
        apiResponse(res, 200, "All accounts fetched", accounts);
    } catch (err) {
        apiError(res, 500, "Failed to fetch accounts", err);
    }
};

/**
 * Get booking history of a specific account
 */
const getBookingHistory = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).sort({ date: -1 });
        apiResponse(res, 200, "Booking history fetched", bookings);
    } catch (err) {
        apiError(res, 500, "Failed to fetch booking history", err);
    }
};

/**
 * Delete account (any role)
 */
const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);

        if (!deleted) {
            apiError(res, 404, "Account not found");
            return;
        }

        apiResponse(res, 200, "Account deleted successfully", {});
    } catch (err) {
        apiError(res, 500, "Failed to delete account", err);
    }
};

/**
 * Create an admin account
 */
const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone } = req.body;

        const roleDoc = await Role.findOne({ name: "admin" });
        if (!roleDoc) {
            apiError(res, 500, "Admin role not configured");
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

        apiResponse(res, 201, "Admin account created", {
            id: created._id,
            name: created.name,
            email: created.email,
            role: "admin",
        });
    } catch (err) {
        apiError(res, 500, "Failed to create admin", err);
    }
};

/**
 * Get all bookings (sorted: latest → oldest)
 * Supports optional filters via query params
 */
const getAllBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, userId, employeeId, startDate, endDate } = req.query;

        // Build dynamic filter object
        const filter: any = {};

        if (status) filter.status = status;
        if (userId) filter.userId = userId;
        if (employeeId) filter.employeeId = employeeId;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        // Sort newest → oldest using createdAt
        const bookings = await Booking.find(filter)
            .populate("userId", "name email phone")
            .populate("employeeId", "name email phone")
            .sort({ createdAt: -1 }); // 👈 newest first

        apiResponse(res, 200, "Bookings fetched successfully", bookings);
    } catch (err) {
        apiError(res, 500, "Failed to fetch bookings", err);
    }
};

/**
 * Assign booking to an employee
 */
const updateAssignBooking = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { bookingId, employeeId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        const employee = await User.findById(employeeId).populate("role");
        if (!employee || (employee.role as any).name !== "emp") {
            apiError(res, 400, "Invalid employee ID");
            return;
        }

        booking.employeeId = employee._id as any;
        booking.status = "assigned";
        booking.assignedAt = new Date();
        await booking.save();

        apiResponse(res, 200, "Booking assigned successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to assign booking", err);
    }
};

/**
 * View all reviews
 */
const viewAllReviews = async (_req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find().populate("bookingId userId");
        apiResponse(res, 200, "All reviews fetched", reviews);
    } catch (err) {
        apiError(res, 500, "Failed to fetch reviews", err);
    }
};

/**
 * Get own profile
 */
const getProfileSelf = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            apiError(res, 404, "User not found");
            return;
        }

        apiResponse(res, 200, "Profile fetched successfully", user);
    } catch (err) {
        apiError(res, 500, "Failed to fetch profile", err);
    }
};

/**
 * Update own profile
 */
const updateProfileSelf = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true,
        }).select("-password");

        apiResponse(res, 200, "Profile updated successfully", updated);
    } catch (err) {
        apiError(res, 500, "Failed to update profile", err);
    }
};

/**
 * Delete own profile
 */
const deleteProfileSelf = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        await User.findByIdAndDelete(req.user.id);
        apiResponse(res, 200, "Profile deleted successfully", {});
    } catch (err) {
        apiError(res, 500, "Failed to delete profile", err);
    }
};

export default {
    getAllAccounts,
    getBookingHistory,
    getAllBookings,
    deleteAccount,
    createAdmin,
    updateAssignBooking,
    viewAllReviews,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
