import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";
import superController from "../controllers/superAdmin.controller";
import adminController from "../controllers/admin.controller";
import superAdminController from "../controllers/superAdmin.controller";
const router = Router();

// 📌 Accounts
router.get(
    "/accounts",
    authMiddleware,
    requirePermissions("GET_ALL_ACCOUNTS"),
    superController.getAllAccounts
);

router.get(
    "/accounts/:userId/bookings",
    authMiddleware,
    requirePermissions("GET_BOOKING_HISTORY"),
    superController.getBookingHistory
);

router.delete(
    "/accounts/:id",
    authMiddleware,
    requirePermissions("DELETE_ACCOUNT"),
    superController.deleteAccount
);

router.post(
    "/accounts/admin",
    authMiddleware,
    requirePermissions("CREATE_ADMIN"),
    superController.createAdmin
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
    superAdminController.getAllBookings
);

router.patch(
    "/bookings/assign",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    superController.updateAssignBooking
);

// 📌 Reviews
router.get(
    "/reviews",
    authMiddleware,
    requirePermissions("VIEW_ALL_REVIEWS"),
    superController.viewAllReviews
);

// 📌 Profile
router.get(
    "/profile",
    authMiddleware,
    requirePermissions("GET_PROFILE_SELF"),
    superController.getProfileSelf
);

router.patch(
    "/profile",
    authMiddleware,
    requirePermissions("UPDATE_PROFILE_SELF"),
    superController.updateProfileSelf
);

router.delete(
    "/profile",
    authMiddleware,
    requirePermissions("DELETE_PROFILE_SELF"),
    superController.deleteProfileSelf
);

export default router;
