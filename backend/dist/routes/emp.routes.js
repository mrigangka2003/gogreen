"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const emp_controller_1 = __importDefault(require("../controllers/emp.controller"));
const router = (0, express_1.Router)();
// 📌 Bookings
router.get("/bookings", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ASSIGNED_BOOKING"), emp_controller_1.default.getAssignedBookings);
router.get("/bookings/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ASSIGNED_BOOKING_DETAILS"), emp_controller_1.default.getAssignedBookingDetails);
router.get("/bookings/:id/review", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ASSIGNED_BOOKING_REVIEW"), emp_controller_1.default.getAssignedBookingReview);
// 📌 Photos
router.patch("/bookings/:id/before-photo", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_BEFORE_PHOTO"), emp_controller_1.default.updateBeforePhoto);
router.patch("/bookings/:id/after-photo", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_AFTER_PHOTO"), emp_controller_1.default.updateAfterPhoto);
// 📌 Status
router.patch("/bookings/:id/status", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_ASSIGNED_BOOKING"), // Reusing an existing employee permission
emp_controller_1.default.updateBookingStatus);
// 📌 Profile
router.get("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_PROFILE_SELF"), emp_controller_1.default.getProfileSelf);
router.patch("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_PROFILE_SELF"), emp_controller_1.default.updateProfileSelf);
router.delete("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("DELETE_PROFILE_SELF"), emp_controller_1.default.deleteProfileSelf);
exports.default = router;
