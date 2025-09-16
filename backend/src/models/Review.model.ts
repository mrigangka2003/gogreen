import mongoose, { Schema } from "mongoose";

export interface IReview extends Document {
    bookingId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    rating: number;
    feedback?: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
