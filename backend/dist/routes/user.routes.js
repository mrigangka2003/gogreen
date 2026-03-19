"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const router = (0, express_1.Router)();
// 📌 Booking
router.post("/bookings", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_BOOKING"), user_controller_1.default.createBooking);
router.patch("/bookings/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_BOOKING"), user_controller_1.default.updateBooking);
router.get('/my-bookings', auth_1.authMiddleware, user_controller_1.default.getMyBookings);
// 📌 Review
router.post("/reviews", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_REVIEW_SELF"), user_controller_1.default.createReviewSelf);
router.patch("/reviews/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_REVIEW_SELF"), user_controller_1.default.updateReviewSelf);
router.delete("/reviews/:id", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("DELETE_REVIEW_SELF"), user_controller_1.default.deleteReviewSelf);
// 📌 Profile
router.get("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("GET_PROFILE_SELF"), user_controller_1.default.getProfileSelf);
router.patch("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("UPDATE_PROFILE_SELF"), user_controller_1.default.updateProfileSelf);
router.delete("/profile", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("DELETE_PROFILE_SELF"), user_controller_1.default.deleteProfileSelf);
exports.default = router;
