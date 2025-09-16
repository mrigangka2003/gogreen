import { Request, Response } from "express";
import Booking from "../models/booking.model";
import Review from "../models/review.model";
import User from "../models/user.model";
import { apiError, apiResponse } from "../helper";

/**
 * Create a booking (self/org)
 */
const createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            serviceType,
            address,
            phoneNumber,
            instruction,
            date,
            timeSlot,
        } = req.body;

        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const booking = await Booking.create({
            userId: req.user.id,
            serviceType,
            address,
            phoneNumber,
            instruction,
            date,
            timeSlot,
        });

        apiResponse(res, 201, "Booking created successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to create booking", err);
    }
};

/**
 * Update a booking (only own bookings if still pending)
 */
const updateBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const booking = await Booking.findOne({ _id: id, userId: req.user.id });

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        if (booking.status !== "pending") {
            apiError(res, 400, "Only pending bookings can be updated");
            return;
        }

        Object.assign(booking, req.body);
        await booking.save();

        apiResponse(res, 200, "Booking updated successfully", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update booking", err);
    }
};

/**
 * Create review for own booking
 */
const createReviewSelf = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { bookingId, rating, feedback } = req.body;
        const booking = await Booking.findOne({
            _id: bookingId,
            userId: req.user.id,
        });

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        if (booking.status !== "completed") {
            apiError(res, 400, "Cannot review until booking is completed");
            return;
        }

        const review = await Review.create({
            bookingId,
            userId: req.user.id,
            rating,
            feedback,
        });

        apiResponse(res, 201, "Review created successfully", review);
    } catch (err) {
        apiError(res, 500, "Failed to create review", err);
    }
};

/**
 * Update own review
 */
const updateReviewSelf = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const review = await Review.findOne({ _id: id, userId: req.user.id });

        if (!review) {
            apiError(res, 404, "Review not found");
            return;
        }

        Object.assign(review, req.body);
        await review.save();

        apiResponse(res, 200, "Review updated successfully", review);
    } catch (err) {
        apiError(res, 500, "Failed to update review", err);
    }
};

/**
 * Delete own review
 */
const deleteReviewSelf = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const review = await Review.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });

        if (!review) {
            apiError(res, 404, "Review not found");
            return;
        }

        apiResponse(res, 200, "Review deleted successfully", {});
    } catch (err) {
        apiError(res, 500, "Failed to delete review", err);
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
    createBooking,
    updateBooking,
    createReviewSelf,
    updateReviewSelf,
    deleteReviewSelf,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
