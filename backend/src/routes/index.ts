import { Router } from "express";

// Routes
import userRoutes from "./user.routes";
import empRoutes from "./emp.routes";
import adminRoutes from "./admin.routes";
import superRoutes from "./superAdmin.routes";

// Auth controllers
import authController from "../controllers/auth/auth.controller";

// Middleware
import { authMiddleware } from "../middlewares/auth";

const router = Router();

/**
 * 🔐 Auth routes
 */
router.post("/signup", authController.register);
router.post("/login", authController.login);
router.post("/logout", authMiddleware, authController.logout);

/**
 *  User/Org routes (user and org share the same routes/permissions)
 */
router.use("/user", userRoutes);
router.use("/org", userRoutes); // reuse user routes for org role

/**
 *  Employee routes
 */
router.use("/emp", empRoutes);

/**
 *  Admin routes
 */
router.use("/admin", adminRoutes);

/**
 * Super Admin routes
 */
router.use("/super", superRoutes);

export default router;
