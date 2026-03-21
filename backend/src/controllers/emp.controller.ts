import { Request, Response } from "express";

import { User, Booking, Review } from "../models";

import { apiError, apiResponse } from "../helper";
import { uploadToCloudinary, uploadVideoToCloudinary } from "../utils/uploadPhoto";

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

        const bookings = await Booking.find({
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        }).sort({ date: -1 });
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
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        }).populate("userId", "name email phone");

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
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
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
 * Update start-photo for assigned booking
 * Accepts base64 photo + geolocation, uploads to Cloudinary
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
        const { photo, video, location } = req.body;

        if (!photo && !video) {
            apiError(res, 400, "Photo or video is required");
            return;
        }

        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            apiError(res, 400, "Geolocation (lat, lng) is required");
            return;
        }

        const booking = await Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });

        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        const assignment = booking.assignments.find(
            (a: any) =>
                a.employeeId.toString() === req.user?.id &&
                a.status !== "removed"
        );

        if (!assignment) {
            apiError(res, 404, "Active assignment not found for this employee");
            return;
        }

        // Upload photo to Cloudinary if provided
        let photoUrl = "";
        if (photo) {
            photoUrl = await uploadToCloudinary(photo, "gogreen/start-photos");
            assignment.startPhoto = photoUrl;
        }

        // Upload video to Cloudinary if provided
        let videoUrl = "";
        if (video) {
            videoUrl = await uploadVideoToCloudinary(video, "gogreen/start-videos");
            (assignment as any).startVideo = videoUrl;
        }

        assignment.startLocation = {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date(),
        };

        // Set booking-level start photo/video if this is the first employee to upload
        const hasExistingStartPhoto = booking.assignments.some(
            (a: any) =>
                a.startPhoto &&
                a.status !== "removed" &&
                a.employeeId.toString() !== req.user?.id
        );
        if (photoUrl && (!hasExistingStartPhoto || !booking.startPhoto)) {
            booking.startPhoto = photoUrl;
        }
        if (videoUrl && !(booking as any).startVideo) {
            (booking as any).startVideo = videoUrl;
        }

        await booking.save();

        apiResponse(res, 200, "Start photo updated", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update start photo", err);
    }
};

/**
 * Update end-photo for assigned booking
 * Accepts base64 photo + geolocation, uploads to Cloudinary
 */
const updateAfterPhoto = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const { photo, video, location } = req.body;

        if (!photo && !video) {
            apiError(res, 400, "Photo or video is required");
            return;
        }

        if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
            apiError(res, 400, "Geolocation (lat, lng) is required");
            return;
        }

        const booking = await Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });

        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        const assignment = booking.assignments.find(
            (a: any) =>
                a.employeeId.toString() === req.user?.id &&
                a.status !== "removed"
        );

        if (!assignment) {
            apiError(res, 404, "Active assignment not found for this employee");
            return;
        }

        // Upload photo to Cloudinary if provided
        let photoUrl = "";
        if (photo) {
            photoUrl = await uploadToCloudinary(photo, "gogreen/end-photos");
            assignment.endPhoto = photoUrl;
        }

        // Upload video to Cloudinary if provided
        let videoUrl = "";
        if (video) {
            videoUrl = await uploadVideoToCloudinary(video, "gogreen/end-videos");
            (assignment as any).endVideo = videoUrl;
        }

        assignment.endLocation = {
            lat: location.lat,
            lng: location.lng,
            timestamp: new Date(),
        };

        // Set booking-level end photo/video if this is the first employee to upload
        const hasExistingEndPhoto = booking.assignments.some(
            (a: any) =>
                a.endPhoto &&
                a.status !== "removed" &&
                a.employeeId.toString() !== req.user?.id
        );
        if (photoUrl && (!hasExistingEndPhoto || !booking.endPhoto)) {
            booking.endPhoto = photoUrl;
        }
        if (videoUrl && !(booking as any).endVideo) {
            (booking as any).endVideo = videoUrl;
        }

        await booking.save();

        apiResponse(res, 200, "End photo updated", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update end photo", err);
    }
};

/**
 * Update status for assigned booking
 */
const updateBookingStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            apiError(res, 401, "Unauthorized");
            return;
        }

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "started",
            "completed",
        ];
        if (!validStatuses.includes(status)) {
            apiError(
                res,
                400,
                "Invalid status. Must be one of: started, completed"
            );
            return;
        }

        const booking = await Booking.findOne({
            _id: id,
            assignments: {
                $elemMatch: {
                    employeeId: req.user.id,
                    status: { $ne: "removed" },
                },
            },
        });

        if (!booking) {
            apiError(res, 404, "Booking not found or not assigned to you");
            return;
        }

        const assignment = booking.assignments.find(
            (a: any) =>
                a.employeeId.toString() === req.user?.id &&
                a.status !== "removed"
        );

        if (!assignment) {
            apiError(res, 404, "Active assignment not found for this employee");
            return;
        }

        // Enforce media requirements (photo or video)
        if (status === "started" && !assignment.startPhoto && !(assignment as any).startVideo) {
            apiError(
                res,
                400,
                "You must upload a start photo or video before starting the task"
            );
            return;
        }
        if (status === "completed" && !assignment.endPhoto && !(assignment as any).endVideo) {
            apiError(
                res,
                400,
                "You must upload an end photo or video before completing the task"
            );
            return;
        }

        assignment.status = status;
        if (status === "completed") {
            assignment.endTime = new Date();
        }
        if (status === "started") {
            assignment.startTime = new Date();
        }
        await booking.save();

        apiResponse(res, 200, "Booking status updated", booking);
    } catch (err) {
        apiError(res, 500, "Failed to update booking status", err);
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
    updateBookingStatus,
    getProfileSelf,
    updateProfileSelf,
    deleteProfileSelf,
};
