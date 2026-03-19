import { Router } from "express";
import userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";

const organizationRoutes = Router();

organizationRoutes.post(
    "/bookings",
    authMiddleware,
    requirePermissions("CREATE_BOOKING"),
    userController.createBooking
);

// Org can view their own bookings (reuses same controller - handles org role)
organizationRoutes.get(
    "/my-bookings",
    authMiddleware,
    userController.getMyBookings
);

export default organizationRoutes;
