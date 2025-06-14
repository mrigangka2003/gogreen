import { Response } from "express";
import mongoose from "mongoose";

import { AuthRequest } from "../middlewares/authMiddleware";
import { apiResponse, apiError } from "../helper";
import Booking from "../models/booking.model";
import User from "../models/user.model";




const createBooking = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    if (req.user?.role !== "user") {
        apiError(res, 403, "Only users can create bookings");
        return;
    }

    try {
        const { date, time, address, totalAmount, notes } = req.body;
        const userId = req.user?.id;

        if (!date || !time || !address) {
            apiError(res, 400, "Date, time, and address are required");
            return;
        }

        if (!totalAmount || totalAmount <= 0) {
            apiError(res, 400, "Valid total amount is required");
            return;
        }

        let bookingDateTime;
        try {
            if (time.includes(":")) {
                bookingDateTime = new Date(`${date}T${time}:00`);
            } else {
                bookingDateTime = new Date(`${date}T${time}`);
            }
        } catch (dateError) {
            apiError(res, 400, "Invalid date or time format");
            return;
        }

        if (bookingDateTime <= new Date()) {
            apiError(res, 400, "Booking date must be in the future");
            return;
        }

        const newBooking = new Booking({
            userId: userId,
            bookingDate: bookingDateTime,
            totalAmount: totalAmount,
            status: "pending",
            paymentStatus: "pending",
            notes: notes || undefined,
        });

        const savedBooking = await newBooking.save();

        await User.findByIdAndUpdate(
            userId,
            { $push: { bookings: savedBooking._id } },
            { new: true }
        );

        const populatedBooking = await Booking.findById(
            savedBooking._id
        ).populate("userId", "name email phone");

        apiResponse(res, 201, "Booking Successfully Created", populatedBooking);
    } catch (error) {
        apiError(res, 500, "Failed to create booking", error);
    }
};






const getUserBookings = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user._id;

        if (!userId) {
            apiError(res, 401, "User doesn't exists");
            return;
        }

        const userWithBookings = await User.findById(userId)
            .populate({
                path: "bookings",
                select: "-__v",
                options: { sort: { createdAt: -1 } },
            })
            .select("-password");

        if (!userWithBookings) {
            apiError(res, 404, "Bookings not found");
            return;
        }

        apiResponse(res, 200, "Bookings Retrieved successfully");
    } catch (error) {
        apiError(res, 500, "Something went wrong");
    }
};







const addBookingFeedback = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { bookingId } = req.params;
        const { rating, comment } = req.body;

        if (!userId) {
            apiError(res, 401, "User doesn't exists");
            return;
        }

        if (!bookingId || !rating) {
            apiError(res, 401, "all the fields should be filled");
            return;
        }

        if (rating < 1 || rating > 5) {
            apiError(res, 401, "please rate in the range");
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            apiError(res, 400, "Invalid booking ID");
            return;
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        // Check if booking belongs to the authenticated user
        if (booking.userId.toString() !== userId) {
            apiError(res, 403, "This Booking doesn't belong to you");
        }

        // Check if booking is completed (optional - depends on your business logic)
        if (booking.status !== "completed") {
            apiError(
                res,
                400,
                "You can only add booking that has been completed"
            );
            return;
        }

        // Check if feedback already exists
        if (booking.feedback) {
            apiError(res, 400, "Booking has been given");
            return;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                feedback: {
                    rating: rating,
                    comment: comment || "",
                    createdAt: new Date(),
                },
            },
            { new: true, runValidators: true }
        ).select("-__v");
        apiResponse(res, 200, "Feedback added successfully", {
            booking: updatedBooking,
        });
    } catch (error) {
        apiError(res, 500, "Internal Server Error");
    }
};








export const getBookingDetails = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { bookingId } = req.params;

        if (!userId) {
            apiError(res, 404, "User not authenticated");
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            apiResponse(res, 400, "Invalid booking ID ");
            return;
        }

        const booking = await Booking.findById(bookingId).select("-__v");

        if (!booking) {
            apiError(res, 401, "Booking not found");
            return;
        }

        if (booking.userId.toString() !== userId) {
            apiResponse(res, 403, "AccessDenied");
            return;
        }

        apiResponse(
            res,
            200,
            "Booking details retrieved Successfully",
            booking
        );
    } catch (error) {
        apiError(res, 500, "Internal Server Error");
    }
};

export { createBooking, getUserBookings, addBookingFeedback };