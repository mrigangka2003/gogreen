"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_1 = require("../middlewares/auth");
const rbac_1 = require("../middlewares/rbac");
const organizationRoutes = (0, express_1.Router)();
organizationRoutes.post("/bookings", auth_1.authMiddleware, (0, rbac_1.requirePermissions)("CREATE_BOOKING"), user_controller_1.default.createBooking);
// Org can view their own bookings (reuses same controller - handles org role)
organizationRoutes.get("/my-bookings", auth_1.authMiddleware, user_controller_1.default.getMyBookings);
exports.default = organizationRoutes;
