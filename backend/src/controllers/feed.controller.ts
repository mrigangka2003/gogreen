import { Request, Response } from "express";
import Feed from "../models/feed.model";
import Booking from "../models/booking.model";
import { uploadToCloudinary, uploadVideoToCloudinary } from "../utils/uploadPhoto";

const apiResponse = (res: Response, status: number, message: string, data?: any) => {
    res.status(status).json({ success: status < 400, message, data });
};

const apiError = (res: Response, status: number, message: string, err?: any) => {
    console.error(message, err?.message || err);
    res.status(status).json({ success: false, message });
};

/**
 * Create a new feed post
 */
const createFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            heading, description, photos, videos,
            location, startLocation, endLocation,
            serviceType, status, bookingId, tags,
            source,
        } = req.body;

        const userId = (req as any).user?._id || (req as any).user?.id;

        // Upload photos to Cloudinary if they are base64
        const uploadedPhotos: string[] = [];
        if (photos && Array.isArray(photos)) {
            for (const photo of photos) {
                if (photo.startsWith("data:")) {
                    const url = await uploadToCloudinary(photo, "gogreen/feeds");
                    uploadedPhotos.push(url);
                } else {
                    uploadedPhotos.push(photo); // already a URL
                }
            }
        }

        // Upload videos to Cloudinary if they are base64
        const uploadedVideos: string[] = [];
        if (videos && Array.isArray(videos)) {
            for (const video of videos) {
                if (video.startsWith("data:")) {
                    const url = await uploadVideoToCloudinary(video, "gogreen/feeds");
                    uploadedVideos.push(url);
                } else {
                    uploadedVideos.push(video);
                }
            }
        }

        const feed = await Feed.create({
            heading,
            description,
            photos: uploadedPhotos,
            videos: uploadedVideos,
            location,
            startLocation,
            endLocation,
            serviceType,
            status: status || "published",
            createdBy: userId,
            bookingId: bookingId || null,
            tags: tags || [],
            metadata: {
                source: source || (bookingId ? "booking" : "manual"),
                userAgent: req.headers["user-agent"],
                ipAddress: req.ip,
            },
        });

        apiResponse(res, 201, "Feed created successfully", feed);
    } catch (err) {
        apiError(res, 500, "Failed to create feed", err);
    }
};

/**
 * Get all feeds (admin view - includes drafts/archived)
 */
const getAllFeeds = async (req: Request, res: Response): Promise<void> => {
    try {
        const feeds = await Feed.find()
            .populate("createdBy", "name email role")
            .populate("bookingId", "serviceType address date status")
            .sort({ createdAt: -1 });
        apiResponse(res, 200, "Feeds fetched", feeds);
    } catch (err) {
        apiError(res, 500, "Failed to fetch feeds", err);
    }
};

/**
 * Get published feeds (public/user view)
 */
const getPublishedFeeds = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [feeds, total] = await Promise.all([
            Feed.find({ status: "published" })
                .populate("createdBy", "name email role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Feed.countDocuments({ status: "published" }),
        ]);

        apiResponse(res, 200, "Published feeds fetched", {
            feeds,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        apiError(res, 500, "Failed to fetch feeds", err);
    }
};

/**
 * Get single feed by ID
 */
const getFeedById = async (req: Request, res: Response): Promise<void> => {
    try {
        const feed = await Feed.findById(req.params.id)
            .populate("createdBy", "name email role")
            .populate("bookingId", "serviceType address date status");

        if (!feed) {
            apiError(res, 404, "Feed not found");
            return;
        }

        // Increment view count
        feed.viewCount += 1;
        await feed.save();

        apiResponse(res, 200, "Feed fetched", feed);
    } catch (err) {
        apiError(res, 500, "Failed to fetch feed", err);
    }
};

/**
 * Update a feed
 */
const updateFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            heading, description, photos, videos,
            location, startLocation, endLocation,
            serviceType, status, tags,
        } = req.body;

        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            apiError(res, 404, "Feed not found");
            return;
        }

        // Process new photos (upload base64, keep URLs)
        if (photos && Array.isArray(photos)) {
            const processed: string[] = [];
            for (const photo of photos) {
                if (photo.startsWith("data:")) {
                    const url = await uploadToCloudinary(photo, "gogreen/feeds");
                    processed.push(url);
                } else {
                    processed.push(photo);
                }
            }
            feed.photos = processed;
        }

        if (videos && Array.isArray(videos)) {
            const processed: string[] = [];
            for (const video of videos) {
                if (video.startsWith("data:")) {
                    const url = await uploadVideoToCloudinary(video, "gogreen/feeds");
                    processed.push(url);
                } else {
                    processed.push(video);
                }
            }
            feed.videos = processed;
        }

        if (heading !== undefined) feed.heading = heading;
        if (description !== undefined) feed.description = description;
        if (location !== undefined) feed.location = location;
        if (startLocation !== undefined) feed.startLocation = startLocation;
        if (endLocation !== undefined) feed.endLocation = endLocation;
        if (serviceType !== undefined) feed.serviceType = serviceType;
        if (status !== undefined) feed.status = status;
        if (tags !== undefined) feed.tags = tags;

        await feed.save();
        apiResponse(res, 200, "Feed updated", feed);
    } catch (err) {
        apiError(res, 500, "Failed to update feed", err);
    }
};

/**
 * Delete a feed
 */
const deleteFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const feed = await Feed.findByIdAndDelete(req.params.id);
        if (!feed) {
            apiError(res, 404, "Feed not found");
            return;
        }
        apiResponse(res, 200, "Feed deleted");
    } catch (err) {
        apiError(res, 500, "Failed to delete feed", err);
    }
};

/**
 * Like / unlike a feed
 */
const toggleLike = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?._id || (req as any).user?.id;
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            apiError(res, 404, "Feed not found");
            return;
        }

        const existingIdx = feed.likes.findIndex(
            (l) => l.userId.toString() === userId.toString()
        );

        if (existingIdx >= 0) {
            feed.likes.splice(existingIdx, 1);
            feed.likeCount = Math.max(0, feed.likeCount - 1);
        } else {
            feed.likes.push({ userId, likedAt: new Date() });
            feed.likeCount += 1;
        }

        await feed.save();
        apiResponse(res, 200, existingIdx >= 0 ? "Unliked" : "Liked", {
            liked: existingIdx < 0,
            likeCount: feed.likeCount,
        });
    } catch (err) {
        apiError(res, 500, "Failed to toggle like", err);
    }
};

/**
 * Record a share
 */
const recordShare = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?._id || (req as any).user?.id;
        const { platform, deviceInfo } = req.body;
        const feed = await Feed.findById(req.params.id);
        if (!feed) {
            apiError(res, 404, "Feed not found");
            return;
        }

        feed.shares.push({
            userId,
            sharedAt: new Date(),
            platform: platform || "other",
            deviceInfo,
        });
        feed.shareCount += 1;
        await feed.save();

        apiResponse(res, 200, "Share recorded", { shareCount: feed.shareCount });
    } catch (err) {
        apiError(res, 500, "Failed to record share", err);
    }
};

/**
 * Get booking data for feed creation (photos, videos, locations)
 */
const getBookingForFeed = async (req: Request, res: Response): Promise<void> => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate("assignments.employeeId", "name")
            .populate("userId", "name");

        if (!booking) {
            apiError(res, 404, "Booking not found");
            return;
        }

        // Collect all photos and videos from booking + assignments
        const photos: string[] = [];
        const videos: string[] = [];
        const locations: { start: any[]; end: any[] } = { start: [], end: [] };

        if (booking.startPhoto) photos.push(booking.startPhoto);
        if (booking.endPhoto) photos.push(booking.endPhoto);
        if (booking.referencePhoto) photos.push(booking.referencePhoto);
        if (booking.startVideo) videos.push(booking.startVideo);
        if (booking.endVideo) videos.push(booking.endVideo);

        for (const assignment of booking.assignments) {
            if (assignment.startPhoto) photos.push(assignment.startPhoto);
            if (assignment.endPhoto) photos.push(assignment.endPhoto);
            if (assignment.startVideo) videos.push(assignment.startVideo);
            if (assignment.endVideo) videos.push(assignment.endVideo);
            if (assignment.startLocation) locations.start.push(assignment.startLocation);
            if (assignment.endLocation) locations.end.push(assignment.endLocation);
        }

        apiResponse(res, 200, "Booking data for feed", {
            booking: {
                _id: booking._id,
                serviceType: booking.serviceType,
                address: booking.address,
                date: booking.date,
                status: booking.status,
                userName: (booking.userId as any)?.name,
            },
            photos: photos.filter(Boolean),
            videos: videos.filter(Boolean),
            locations,
        });
    } catch (err) {
        apiError(res, 500, "Failed to fetch booking data", err);
    }
};

export default {
    createFeed,
    getAllFeeds,
    getPublishedFeeds,
    getFeedById,
    updateFeed,
    deleteFeed,
    toggleLike,
    recordShare,
    getBookingForFeed,
};
