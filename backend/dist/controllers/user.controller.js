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
exports.getMyBookings = void 0;
const models_1 = require("../models");
const helper_1 = require("../helper");
const uploadPhoto_1 = require("../utils/uploadPhoto");
/**
 * Create a booking (self/org)
 */
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        // Validate required fields
        const { serviceId, address, phoneNumber, instruction, date, timeSlot, referencePhoto, } = req.body;
        if (!address || !phoneNumber || !date) {
            (0, helper_1.apiError)(res, 400, "Address, phone number, and date are required");
            return;
        }
        // Resolve service
        if (!serviceId) {
            (0, helper_1.apiError)(res, 400, "serviceId is required");
            return;
        }
        const service = yield models_1.Service.findById(serviceId);
        if (!service || !service.isActive) {
            (0, helper_1.apiError)(res, 400, "Service not found or inactive");
            return;
        }
        // Upload reference photo if provided
        let referencePhotoUrl = "";
        if (referencePhoto) {
            try {
                referencePhotoUrl = yield (0, uploadPhoto_1.uploadToCloudinary)(referencePhoto, "gogreen/reference-photos");
            }
            catch (uploadErr) {
                (0, helper_1.apiError)(res, 500, "Failed to upload reference photo", uploadErr);
                return;
            }
        }
        const booking = yield models_1.Booking.create({
            userId: req.user.id,
            serviceId: service._id,
            serviceType: service.title,
            address,
            phoneNumber,
            instruction,
            referencePhoto: referencePhotoUrl,
            date,
            timeSlot,
        });
        (0, helper_1.apiResponse)(res, 201, "Booking created successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create booking", err);
    }
});
/**
 * Update a booking (only own bookings if still pending)
 */
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const booking = yield models_1.Booking.findOne({ _id: id, userId: req.user.id });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        if (booking.status !== "pending") {
            (0, helper_1.apiError)(res, 400, "Only pending bookings can be updated");
            return;
        }
        // Only allow updating safe fields
        const { address, phoneNumber, instruction, date, timeSlot, referencePhoto } = req.body;
        if (address !== undefined)
            booking.address = address;
        if (phoneNumber !== undefined)
            booking.phoneNumber = phoneNumber;
        if (instruction !== undefined)
            booking.instruction = instruction;
        if (date !== undefined)
            booking.date = date;
        if (timeSlot !== undefined)
            booking.timeSlot = timeSlot;
        if (referencePhoto) {
            try {
                booking.referencePhoto = yield (0, uploadPhoto_1.uploadToCloudinary)(referencePhoto, "gogreen/reference-photos");
            }
            catch (uploadErr) {
                (0, helper_1.apiError)(res, 500, "Failed to upload reference photo", uploadErr);
                return;
            }
        }
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Booking updated successfully", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update booking", err);
    }
});
/**
 * Create review for own booking
 */
const createReviewSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { bookingId, rating, feedback } = req.body;
        const booking = yield models_1.Booking.findOne({
            _id: bookingId,
            userId: req.user.id,
        });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found");
            return;
        }
        if (booking.status !== "completed") {
            (0, helper_1.apiError)(res, 400, "Cannot review until booking is completed");
            return;
        }
        // Prevent duplicate reviews
        const existingReview = yield models_1.Review.findOne({ bookingId, userId: req.user.id });
        if (existingReview) {
            (0, helper_1.apiError)(res, 409, "You have already reviewed this booking");
            return;
        }
        const review = yield models_1.Review.create({
            bookingId,
            userId: req.user.id,
            rating,
            feedback,
        });
        (0, helper_1.apiResponse)(res, 201, "Review created successfully", review);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create review", err);
    }
});
/**
 * Update own review
 */
const updateReviewSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const review = yield models_1.Review.findOne({ _id: id, userId: req.user.id });
        if (!review) {
            (0, helper_1.apiError)(res, 404, "Review not found");
            return;
        }
        // Only allow updating safe fields (not bookingId, userId, _id)
        const { rating, feedback } = req.body;
        if (rating !== undefined)
            review.rating = rating;
        if (feedback !== undefined)
            review.feedback = feedback;
        yield review.save();
        (0, helper_1.apiResponse)(res, 200, "Review updated successfully", review);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update review", err);
    }
});
/**
 * Delete own review
 */
const deleteReviewSelf = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const review = yield models_1.Review.findOneAndDelete({
            _id: id,
            userId: req.user.id,
        });
        if (!review) {
            (0, helper_1.apiError)(res, 404, "Review not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Review deleted successfully", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to delete review", err);
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
const getMyBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            // same guard you use above
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id: userId, role } = req.user;
        if (!["user", "org"].includes(role)) {
            (0, helper_1.apiError)(res, 403, "Role cannot view bookings");
            return;
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const filter = { userId, isActive: true };
        if (req.query.status)
            filter.status = req.query.status;
        const [bookings, total] = yield Promise.all([
            models_1.Booking.find(filter)
                .populate("assignments.employeeId", "name phone")
                .populate("review")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            models_1.Booking.countDocuments(filter),
        ]);
        // if (!bookings.length) {
        //     apiError(res, 404, "No bookings found");
        //     return;
        // }
        (0, helper_1.apiResponse)(res, 200, "Bookings fetched", {
            bookings,
            total,
            page,
            pages: Math.ceil(total / limit),
        });
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch bookings", err);
    }
});
exports.getMyBookings = getMyBookings;
exports.default = {
    createBooking,
    updateBooking,
    createReviewSelf,
    updateReviewSelf,
    deleteReviewSelf,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
    getMyBookings: exports.getMyBookings,
};
