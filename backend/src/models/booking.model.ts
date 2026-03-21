import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IAssignment {
    employeeId: Types.ObjectId;
    status: "assigned" | "started" | "completed" | "removed";
    assignedAt: Date;
    startTime?: Date;
    endTime?: Date;
    startPhoto?: string;
    endPhoto?: string;
    startVideo?: string;
    endVideo?: string;
    startLocation?: {
        lat: number;
        lng: number;
        timestamp: Date;
    };
    endLocation?: {
        lat: number;
        lng: number;
        timestamp: Date;
    };
}

export interface IBooking extends Document {
    userId: Types.ObjectId;
    assignments: IAssignment[];
    serviceId?: Types.ObjectId;   // ref to Service document
    serviceType: string;          // denormalized service title
    address: string;
    phoneNumber: string;
    instruction?: string;
    referencePhoto?: string;
    startPhoto?: string;
    endPhoto?: string;
    startVideo?: string;
    endVideo?: string;
    date: Date;
    timeSlot?: string;
    status:
        | "pending"
        | "assigned"
        | "completed"
        | "cancelled"
        | "started";
    amount?: number;
    paymentStatus?: "pending" | "paid" | "refunded";
    assignedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    allocatedTime?: number;
    timerStartedAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
    employeeId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["assigned", "started", "completed", "removed"],
        default: "assigned",
    },
    assignedAt: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    startPhoto: { type: String, default: "" },
    endPhoto: { type: String, default: "" },
    startVideo: { type: String, default: "" },
    endVideo: { type: String, default: "" },
    startLocation: {
        lat: Number,
        lng: Number,
        timestamp: Date,
    },
    endLocation: {
        lat: Number,
        lng: Number,
        timestamp: Date,
    },
});

const BookingSchema = new Schema<IBooking>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        assignments: [AssignmentSchema],
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            default: null,
        },
        serviceType: {
            type: String,
            required: true,
            trim: true,
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
        referencePhoto: {
            type: String,
            default: "",
        },
        startPhoto: {
            type: String,
            default: "",
        },
        endPhoto: {
            type: String,
            default: "",
        },
        startVideo: {
            type: String,
            default: "",
        },
        endVideo: {
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
                "completed",
                "cancelled",
                "started",
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
        allocatedTime: { type: Number, default: 0 },
        timerStartedAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

BookingSchema.index({ "assignments.employeeId": 1, date: 1 });
BookingSchema.index({ userId: 1, status: 1, date: -1 });

// Automatic "Global Status" Calculation
BookingSchema.pre<IBooking>("save", function (next) {
    // Don't recalculate if status was explicitly set to a terminal/admin state
    if (
        this.status === "cancelled" ||
        this.status === "completed"
    ) {
        next();
        return;
    }

    const activeAssignments = this.assignments.filter(
        (a) => a.status !== "removed"
    );

    if (activeAssignments.length === 0) {
        this.status = "pending";
    } else {
        const allCompleted = activeAssignments.every((a) => a.status === "completed");
        const anyStarted = activeAssignments.some(
            (a) => a.status === "started" || a.status === "completed"
        );

        if (allCompleted) {
            this.status = "completed";
            if (!this.completedAt) this.completedAt = new Date();
        } else if (anyStarted) {
            this.status = "started";
        } else {
            this.status = "assigned";
        }
    }
    next();
});

BookingSchema.virtual("review", {
    ref: "Review",
    localField: "_id",
    foreignField: "bookingId",
    justOne: true,
});

export default model<IBooking>("Booking", BookingSchema);
