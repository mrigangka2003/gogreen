"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const superAdmin_controller_1 = __importDefault(require("../controllers/superAdmin.controller"));
const admin_controller_1 = __importDefault(require("../controllers/admin.controller"));
const superAdmin_controller_2 = __importDefault(require("../controllers/superAdmin.controller"));
const service_controller_1 = __importDefault(require("../controllers/service.controller"));
const router = (0, express_1.Router)();
// 📌 Accounts
router.get("/accounts", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ALL_ACCOUNTS"), superAdmin_controller_1.default.getAllAccounts);
router.get("/accounts/:userId/bookings", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_BOOKING_HISTORY"), superAdmin_controller_1.default.getBookingHistory);
router.delete("/accounts/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("DELETE_ACCOUNT"), superAdmin_controller_1.default.deleteAccount);
router.patch("/accounts/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_ADMIN"), superAdmin_controller_1.default.updateAccount);
router.patch("/accounts/:userId/role", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_ORG_EMP"), // Reusing existing permission for now
superAdmin_controller_1.default.updateUserRole);
router.post("/accounts/admin", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_ADMIN"), superAdmin_controller_1.default.createAdmin);
router.post("/accounts/super-admin", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_ADMIN"), superAdmin_controller_2.default.createSuperAdmin);
router.post("/accounts", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_ORG_EMP"), admin_controller_1.default.createOrgEmp);
// 📌 Bookings
router.post("/bookings", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("VIEW_ALL_BOOKINGS"), admin_controller_1.default.createBookingAdmin);
router.get("/bookings", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("VIEW_ALL_BOOKINGS"), superAdmin_controller_2.default.getAllBookings);
router.patch("/bookings/assign", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), superAdmin_controller_1.default.updateAssignBooking);
// 📌 Enhanced Task Assignment (reuses admin controller)
router.post("/bookings/assign-task", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), admin_controller_1.default.assignTaskToEmployee);
router.patch("/bookings/:id/status", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), admin_controller_1.default.updateBookingStatusAdmin);
router.patch("/bookings/:id/photos", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), admin_controller_1.default.updateBookingPhotos);
router.patch("/bookings/:id/reassign", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), admin_controller_1.default.reassignBooking);
router.delete("/bookings/:bookingId/employees/:employeeId", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), admin_controller_1.default.removeAssignedEmployee);
// 📌 Per-assignment status update
router.patch("/bookings/:bookingId/assignments/:employeeId/status", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_ASSIGN_BOOKING"), admin_controller_1.default.updateAssignmentStatus);
router.get("/employees/available", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ALL_ACCOUNTS"), admin_controller_1.default.getAvailableEmployees);
// 📌 Reviews
router.get("/reviews", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("VIEW_ALL_REVIEWS"), superAdmin_controller_1.default.viewAllReviews);
// 📌 Profile
router.get("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_PROFILE_SELF"), superAdmin_controller_1.default.getProfileSelf);
router.patch("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_PROFILE_SELF"), superAdmin_controller_1.default.updateProfileSelf);
router.delete("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("DELETE_PROFILE_SELF"), superAdmin_controller_1.default.deleteProfileSelf);
// 📌 Services
router.get("/services", service_controller_1.default.getServices);
router.get("/services/all", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ALL_ACCOUNTS"), service_controller_1.default.getAllServices);
router.post("/services", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("MANAGE_SERVICES"), service_controller_1.default.createService);
router.patch("/services/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("MANAGE_SERVICES"), service_controller_1.default.updateService);
router.delete("/services/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("MANAGE_SERVICES"), service_controller_1.default.deleteService);
exports.default = router;
