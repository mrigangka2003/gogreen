import mongoose from "mongoose";

interface IBooking {
    date: Date;
    time: string;
    address: string;
    user: mongoose.Types.ObjectId;
    status?: "pending" | "completed" | "cancelled";
}

const bookingSchema = new mongoose.Schema<IBooking>(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
