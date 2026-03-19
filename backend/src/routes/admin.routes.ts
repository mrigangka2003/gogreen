import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";
import adminController from "../controllers/admin.controller";
import serviceController from "../controllers/service.controller";

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

router.patch(
    "/accounts/:id",
    authMiddleware,
    requirePermissions("CREATE_ORG_EMP"),
    adminController.updateAccount
);

router.post(
    "/accounts",
    authMiddleware,
    requirePermissions("CREATE_ORG_EMP"),
    adminController.createOrgEmp
);

// 📌 Bookings
router.post(
    "/bookings",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    adminController.createBookingAdmin
);

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

// 📌 Enhanced Task Assignment
router.post(
    "/bookings/assign-task",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.assignTaskToEmployee
);

router.patch(
    "/bookings/:id/status",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.updateBookingStatusAdmin
);

router.patch(
    "/bookings/:id/photos",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.updateBookingPhotos
);

router.delete(
    "/bookings/:bookingId/employees/:employeeId",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.removeAssignedEmployee
);

router.patch(
    "/bookings/:id/reassign",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.reassignBooking
);

// 📌 Per-assignment status update
router.patch(
    "/bookings/:bookingId/assignments/:employeeId/status",
    authMiddleware,
    requirePermissions("UPDATE_ASSIGN_BOOKING"),
    adminController.updateAssignmentStatus
);


router.get(
    "/employees/available",
    authMiddleware,
    requirePermissions("GET_ALL_ACCOUNTS"),
    adminController.getAvailableEmployees
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

// 📌 Services
router.get(
    "/services",
    serviceController.getServices
);

router.get(
    "/services/all",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    serviceController.getAllServices
);

router.post(
    "/services",
    authMiddleware,
    requirePermissions("MANAGE_SERVICES"),
    serviceController.createService
);

router.patch(
    "/services/:id",
    authMiddleware,
    requirePermissions("MANAGE_SERVICES"),
    serviceController.updateService
);

router.delete(
    "/services/:id",
    authMiddleware,
    requirePermissions("MANAGE_SERVICES"),
    serviceController.deleteService
);

export default router;
