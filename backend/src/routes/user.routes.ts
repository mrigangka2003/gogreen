import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";
import userController from "../controllers/user.controller";

const router = Router();

// 📌 Booking
router.post(
    "/bookings",
    authMiddleware,
    requirePermissions("CREATE_BOOKING"),
    userController.createBooking
);

router.patch(
    "/bookings/:id",
    authMiddleware,
    requirePermissions("UPDATE_BOOKING"),
    userController.updateBooking
);

// 📌 Review
router.post(
    "/reviews",
    authMiddleware,
    requirePermissions("CREATE_REVIEW_SELF"),
    userController.createReviewSelf
);

router.patch(
    "/reviews/:id",
    authMiddleware,
    requirePermissions("UPDATE_REVIEW_SELF"),
    userController.updateReviewSelf
);

router.delete(
    "/reviews/:id",
    authMiddleware,
    requirePermissions("DELETE_REVIEW_SELF"),
    userController.deleteReviewSelf
);

// 📌 Profile
router.get(
    "/profile",
    authMiddleware,
    requirePermissions("GET_PROFILE_SELF"),
    userController.getProfileSelf
);

router.patch(
    "/profile",
    authMiddleware,
    requirePermissions("UPDATE_PROFILE_SELF"),
    userController.updateProfileSelf
);

router.delete(
    "/profile",
    authMiddleware,
    requirePermissions("DELETE_PROFILE_SELF"),
    userController.deleteProfileSelf
);

export default router;
