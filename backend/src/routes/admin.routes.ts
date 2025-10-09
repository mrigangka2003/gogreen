import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";
import adminController from "../controllers/admin.controller";

const router = Router();

// 📌 Accounts
router.get(
    "/accounts",
    authMiddleware,
    requirePermissions("GET_ALL_ACCOUNTS"),
    adminController.getAllAccounts
);

router.get(
    "/accounts/:userId/bookings",
    authMiddleware,
    requirePermissions("GET_BOOKING_HISTORY"),
    adminController.getBookingHistory
);

router.delete(
    "/accounts/:id",
    authMiddleware,
    requirePermissions("DELETE_ACCOUNT"),
    adminController.deleteAccount
);

router.post(
    "/accounts",
    authMiddleware,
    requirePermissions("CREATE_ORG_EMP"),
    adminController.createOrgEmp
);

// 📌 Bookings
router.get(
    "/bookings",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    adminController.getAllBookings
);

router.patch(
    "/bookings/assign",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.updateAssignBooking
);

// 📌 Reviews
router.get(
    "/reviews",
    authMiddleware,
    requirePermissions("VIEW_ALL_REVIEWS"),
    adminController.viewAllReviews
);

// 📌 Profile
router.get(
    "/profile",
    authMiddleware,
    requirePermissions("GET_PROFILE_SELF"),
    adminController.getProfileSelf
);

router.patch(
    "/profile",
    authMiddleware,
    requirePermissions("UPDATE_PROFILE_SELF"),
    adminController.updateProfileSelf
);

router.delete(
    "/profile",
    authMiddleware,
    requirePermissions("DELETE_PROFILE_SELF"),
    adminController.deleteProfileSelf
);

export default router;
