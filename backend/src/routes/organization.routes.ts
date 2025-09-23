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



export default organizationRoutes;
