import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeedShare {
    userId: Types.ObjectId;
    sharedAt: Date;
    platform?: string; // "whatsapp" | "facebook" | "twitter" | "copy_link" | "other"
    deviceInfo?: string;
}

export interface IFeedLike {
    userId: Types.ObjectId;
    likedAt: Date;
}

export interface IFeedLocation {
    address: string;
    lat?: number;
    lng?: number;
}

export interface IFeed extends Document {
    heading: string;
    description: string;
    photos: string[];
    videos: string[];
    location?: IFeedLocation;
    startLocation?: IFeedLocation;
    endLocation?: IFeedLocation;
    serviceType?: string;
    status: "draft" | "published" | "archived";

    // Authorship
    createdBy: Types.ObjectId;

    // Linked booking (optional)
    bookingId?: Types.ObjectId;

    // Engagement
    likes: IFeedLike[];
    likeCount: number;
    shares: IFeedShare[];
    shareCount: number;
    viewCount: number;

    // Metadata
    tags: string[];
    metadata: {
        source: "manual" | "booking";
        deviceInfo?: string;
        userAgent?: string;
        ipAddress?: string;
    };

    createdAt: Date;
    updatedAt: Date;
}

const FeedLocationSchema = new Schema<IFeedLocation>(
    {
        address: { type: String, default: "" },
        lat: { type: Number },
        lng: { type: Number },
    },
    { _id: false }
);

const FeedLikeSchema = new Schema<IFeedLike>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        likedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const FeedShareSchema = new Schema<IFeedShare>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        sharedAt: { type: Date, default: Date.now },
        platform: { type: String, default: "other" },
        deviceInfo: { type: String },
    },
    { _id: false }
);

const FeedSchema = new Schema<IFeed>(
    {
        heading: { type: String, required: true, trim: true },
        description: { type: String, default: "", trim: true },
        photos: [{ type: String }],
        videos: [{ type: String }],
        location: { type: FeedLocationSchema },
        startLocation: { type: FeedLocationSchema },
        endLocation: { type: FeedLocationSchema },
        serviceType: { type: String, trim: true },
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "published",
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },
        likes: [FeedLikeSchema],
        likeCount: { type: Number, default: 0 },
        shares: [FeedShareSchema],
        shareCount: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
        tags: [{ type: String, trim: true }],
        metadata: {
            source: { type: String, enum: ["manual", "booking"], default: "manual" },
            deviceInfo: { type: String },
            userAgent: { type: String },
            ipAddress: { type: String },
        },
    },
    { timestamps: true }
);

FeedSchema.index({ createdAt: -1 });
FeedSchema.index({ status: 1, createdAt: -1 });

const Feed = mongoose.model<IFeed>("Feed", FeedSchema);
export default Feed;
