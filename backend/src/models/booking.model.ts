import mongoose, { Schema } from "mongoose";

interface IBooking {
    userId: mongoose.Types.ObjectId;
    bookingDate: Date;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    totalAmount: number;
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    notes?: string;
    feedback?: IFeedback;
}

interface IFeedback {
    rating: number;
    comment?: string;
    createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
    {
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            maxlength: 500,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const bookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookingDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending",
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        notes: {
            type: String,
            maxlength: 1000,
        },
        feedback: FeedbackSchema,
    },
    { timestamps: true }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
