import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";
import empController from "../controllers/emp.controller";

const router = Router();

// 📌 Bookings
router.get(
    "/bookings",
    authMiddleware,
    requirePermissions("GET_ASSIGNED_BOOKING"),
    empController.getAssignedBookings
);

router.get(
    "/bookings/:id",
    authMiddleware,
    requirePermissions("GET_ASSIGNED_BOOKING_DETAILS"),
    empController.getAssignedBookingDetails
);

router.get(
    "/bookings/:id/review",
    authMiddleware,
    requirePermissions("GET_ASSIGNED_BOOKING_REVIEW"),
    empController.getAssignedBookingReview
);

// 📌 Photos
router.patch(
    "/bookings/:id/before-photo",
    authMiddleware,
    requirePermissions("UPDATE_BEFORE_PHOTO"),
    empController.updateBeforePhoto
);

router.patch(
    "/bookings/:id/after-photo",
    authMiddleware,
    requirePermissions("UPDATE_AFTER_PHOTO"),
    empController.updateAfterPhoto
);

// 📌 Status
router.patch(
    "/bookings/:id/status",
    authMiddleware,
    requirePermissions("GET_ASSIGNED_BOOKING"), // Reusing an existing employee permission
    empController.updateBookingStatus
);

// 📌 Profile
router.get(
    "/profile",
    authMiddleware,
    requirePermissions("GET_PROFILE_SELF"),
    empController.getProfileSelf
);

router.patch(
    "/profile",
    authMiddleware,
    requirePermissions("UPDATE_PROFILE_SELF"),
    empController.updateProfileSelf
);

router.delete(
    "/profile",
    authMiddleware,
    requirePermissions("DELETE_PROFILE_SELF"),
    empController.deleteProfileSelf
);

export default router;
