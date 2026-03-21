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
const models_1 = require("../models");
const helper_1 = require("../helper");
const uploadPhoto_1 = require("../utils/uploadPhoto");
/**
 * Get all bookings assigned to the employee
 */
const getAssignedBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const bookings = yield models_1.Booking.find({
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        }).sort({ date: -1 });
        (0, helper_1.apiResponse)(res, 200, "Assigned bookings fetched", bookings);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch assigned bookings", err);
    }
});
/**
 * Get details of a single assigned booking
 */
const getAssignedBookingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const booking = yield models_1.Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        }).populate("userId", "name email phone");
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found or not assigned to you");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Assigned booking details fetched", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch booking details", err);
    }
});
/**
 * Get review for an assigned booking (if exists)
 */
const getAssignedBookingReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const booking = yield models_1.Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found or not assigned to you");
            return;
        }
        const review = yield models_1.Review.findOne({ bookingId: booking._id });
        (0, helper_1.apiResponse)(res, 200, "Review fetched", review !== null && review !== void 0 ? review : {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch review", err);
    }
});
/**
 * Update start-photo for assigned booking
 * Accepts base64 photo + geolocation, uploads to Cloudinary
 */
const updateBeforePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const { photo, location } = req.body;
        if (!photo) {
            (0, helper_1.apiError)(res, 400, "Photo is required");
            return;
        }
        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            (0, helper_1.apiError)(res, 400, "Geolocation (lat, lng) is required");
            return;
        }
        const booking = yield models_1.Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found or not assigned to you");
            return;
        }
        const assignment = booking.assignments.find((a) => {
            var _a;
            return a.employeeId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
                a.status !== "removed";
        });
        if (!assignment) {
            (0, helper_1.apiError)(res, 404, "Active assignment not found for this employee");
            return;
        }
        // Upload to Cloudinary
        const photoUrl = yield (0, uploadPhoto_1.uploadToCloudinary)(photo, "gogreen/start-photos");
        assignment.startPhoto = photoUrl;
        assignment.startLocation = {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date(),
        };
        // Set booking-level start photo if this is the first employee to upload
        const hasExistingStartPhoto = booking.assignments.some((a) => {
            var _a;
            return a.startPhoto &&
                a.status !== "removed" &&
                a.employeeId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        });
        if (!hasExistingStartPhoto || !booking.startPhoto) {
            booking.startPhoto = photoUrl;
        }
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Start photo updated", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update start photo", err);
    }
});
/**
 * Update end-photo for assigned booking
 * Accepts base64 photo + geolocation, uploads to Cloudinary
 */
const updateAfterPhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const { photo, location } = req.body;
        if (!photo) {
            (0, helper_1.apiError)(res, 400, "Photo is required");
            return;
        }
        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            (0, helper_1.apiError)(res, 400, "Geolocation (lat, lng) is required");
            return;
        }
        const booking = yield models_1.Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found or not assigned to you");
            return;
        }
        const assignment = booking.assignments.find((a) => {
            var _a;
            return a.employeeId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
                a.status !== "removed";
        });
        if (!assignment) {
            (0, helper_1.apiError)(res, 404, "Active assignment not found for this employee");
            return;
        }
        // Upload to Cloudinary
        const photoUrl = yield (0, uploadPhoto_1.uploadToCloudinary)(photo, "gogreen/end-photos");
        assignment.endPhoto = photoUrl;
        assignment.endLocation = {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date(),
        };
        // Set booking-level end photo if this is the first employee to upload
        const hasExistingEndPhoto = booking.assignments.some((a) => {
            var _a;
            return a.endPhoto &&
                a.status !== "removed" &&
                a.employeeId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        });
        if (!hasExistingEndPhoto || !booking.endPhoto) {
            booking.endPhoto = photoUrl;
        }
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "End photo updated", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update end photo", err);
    }
});
/**
 * Update status for assigned booking
 */
const updateBookingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            (0, helper_1.apiError)(res, 401, "Unauthorized");
            return;
        }
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = [
            "started",
            "completed",
        ];
        if (!validStatuses.includes(status)) {
            (0, helper_1.apiError)(res, 400, "Invalid status. Must be one of: started, completed");
            return;
        }
        const booking = yield models_1.Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });
        if (!booking) {
            (0, helper_1.apiError)(res, 404, "Booking not found or not assigned to you");
            return;
        }
        const assignment = booking.assignments.find((a) => {
            var _a;
            return a.employeeId.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) &&
                a.status !== "removed";
        });
        if (!assignment) {
            (0, helper_1.apiError)(res, 404, "Active assignment not found for this employee");
            return;
        }
        // Enforce photo requirements
        if (status === "started" && !assignment.startPhoto) {
            (0, helper_1.apiError)(res, 400, "You must upload a start photo before starting the task");
            return;
        }
        if (status === "completed" && !assignment.endPhoto) {
            (0, helper_1.apiError)(res, 400, "You must upload an end photo before completing the task");
            return;
        }
        assignment.status = status;
        if (status === "completed") {
            assignment.endTime = new Date();
        }
        if (status === "started") {
            assignment.startTime = new Date();
        }
        yield booking.save();
        (0, helper_1.apiResponse)(res, 200, "Booking status updated", booking);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update booking status", err);
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
            (0, helper_1.apiError)(res, 401, "Unauthorized");
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
exports.default = {
    getAssignedBookings,
    getAssignedBookingDetails,
    getAssignedBookingReview,
    updateBeforePhoto,
    updateAfterPhoto,
    updateBookingStatus,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
