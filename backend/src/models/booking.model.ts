import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
    userId: Types.ObjectId;
    employeeId?: Types.ObjectId ;
    serviceType: string;
    address: string;
    phoneNumber: string;
    instruction?: string;
    beforePhoto?: string;
    afterPhoto?: string;
    date: Date;
    timeSlot?: string;
    status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
    amount?: number;
    paymentStatus?: "pending" | "paid" | "refunded";
    assignedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // instance methods
    markCompleted(): Promise<IBooking>;
}

const BookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        employeeId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
            index: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        instruction: {
            type: String,
            trim: true,
            default: "",
        },
        beforePhoto: {
            type: String,
            default: "",
        },
        afterPhoto: {
            type: String,
            default: "",
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        timeSlot: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: [
                "pending",
                "assigned",
                "in_progress",
                "completed",
                "cancelled",
            ],
            default: "pending",
            index: true,
        },
        amount: { type: Number, default: 0 },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded"],
            default: "pending",
        },
        assignedAt: { type: Date },
        completedAt: { type: Date },
        cancelledAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

BookingSchema.index({ employeeId: 1, date: 1 });
BookingSchema.index({ userId: 1, status: 1, date: -1 });


BookingSchema.virtual("review", {
    ref: "Review",
    localField: "_id",
    foreignField: "bookingId",
    justOne: true,
});

export default model<IBooking>("Booking", BookingSchema);
