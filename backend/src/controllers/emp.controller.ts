import { Request, Response } from "express";
import Booking from "../models/booking.model";
import Review from "../models/review.model";
import User from "../models/user.model";
import { apiError, apiResponse } from "../helper";

/**
 * Get all bookings assigned to the employee
 */
const getAssignedBookings = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const bookings = await Booking.find({ employeeId: req.user.id }).sort({
            date: -1,
        });
        apiResponse(res, 200, "Assigned bookings fetched", bookings);
    } catch (err) {
        apiError(res, 500, "Failed to fetch assigned bookings", err);
    }
};

/**
 * Get details of a single assigned booking
 */
const getAssignedBookingDetails = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const booking = await Booking.findOne({
            _id: id,
            employeeId: req.user.id,
        }).populate("userId");

        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        apiResponse(res, 200, "Assigned booking details fetched", booking);
    } catch (err) {
        apiError(res, 500, "Failed to fetch booking details", err);
    }
};

/**
 * Get review for an assigned booking (if exists)
 */
const getAssignedBookingReview = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const booking = await Booking.findOne({
            _id: id,
            employeeId: req.user.id,
        });
        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        const review = await Review.findOne({ bookingId: booking._id });
        apiResponse(res, 200, "Review fetched", review ?? {});
    } catch (err) {
        apiError(res, 500, "Failed to fetch review", err);
    }
};

/**
 * Update before-photo for assigned booking
 */
const updateBeforePhoto = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const { beforePhoto } = req.body;

        const booking = await Booking.findOneAndUpdate(
            { _id: id, employeeId: req.user.id },
            { beforePhoto },
            { new: true }
        );

        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        apiResponse(res, 200, "Before photo updated", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update before photo", err);
    }
};

/**
 * Update after-photo for assigned booking
 */
const updateAfterPhoto = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const { afterPhoto } = req.body;

        const booking = await Booking.findOneAndUpdate(
            { _id: id, employeeId: req.user.id },
            { afterPhoto, status: "completed", completedAt: new Date() },
            { new: true }
        );

        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        apiResponse(
            res,
            200,
            "After photo updated, booking marked completed",
            booking
        );
    } catch (err) {
        apiError(res, 500, "Failed to update after photo", err);
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
            apiError(res, 401, "Unauthorized");
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
    getAssignedBookings,
    getAssignedBookingDetails,
    getAssignedBookingReview,
    updateBeforePhoto,
    updateAfterPhoto,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
