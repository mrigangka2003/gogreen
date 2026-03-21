import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requirePermissions } from "../middlewares/rbac";
import feedController from "../controllers/feed.controller";

const router = Router();

// Static routes MUST come before parameterized routes

// Public - published feeds (paginated)
router.get("/published", feedController.getPublishedFeeds);

// Admin - all feeds (includes drafts/archived)
router.get(
    "/all",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    feedController.getAllFeeds
);

// Admin - get booking data for feed creation
router.get(
    "/booking/:bookingId",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    feedController.getBookingForFeed
);

// Admin - create feed
router.post(
    "/",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    feedController.createFeed
);

// Public - single feed (increments view) — MUST be after static routes
router.get("/:id", feedController.getFeedById);

// Authenticated - like/unlike
router.post("/:id/like", authMiddleware, feedController.toggleLike);

// Authenticated - record share
router.post("/:id/share", authMiddleware, feedController.recordShare);

// Admin - update feed
router.patch(
    "/:id",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    feedController.updateFeed
);

// Admin - delete feed
router.delete(
    "/:id",
    authMiddleware,
    requirePermissions("VIEW_ALL_BOOKINGS"),
    feedController.deleteFeed
);

export default router;
