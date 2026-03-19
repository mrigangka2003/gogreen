"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AssignmentSchema = new mongoose_1.Schema({
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["assigned", "started", "ended", "removed"],
        default: "assigned",
    },
    assignedAt: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    startPhoto: { type: String, default: "" },
    endPhoto: { type: String, default: "" },
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
const BookingSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    assignments: [AssignmentSchema],
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    startPhoto: {
        type: String,
        default: "",
    },
    endPhoto: {
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
            "ended",
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
}, { timestamps: true });
BookingSchema.index({ "assignments.employeeId": 1, date: 1 });
BookingSchema.index({ userId: 1, status: 1, date: -1 });
// Automatic "Global Status" Calculation
BookingSchema.pre("save", function (next) {
    // Don't recalculate if status was explicitly set to a terminal/admin state
    if (this.status === "cancelled" ||
        this.status === "completed" ||
        this.status === "ended") {
        next();
        return;
    }
    const activeAssignments = this.assignments.filter((a) => a.status !== "removed");
    if (activeAssignments.length === 0) {
        this.status = "pending";
    }
    else {
        const allEnded = activeAssignments.every((a) => a.status === "ended");
        const anyStarted = activeAssignments.some((a) => a.status === "started" || a.status === "ended");
        if (allEnded) {
            this.status = "ended";
        }
        else if (anyStarted) {
            this.status = "started";
        }
        else {
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
exports.default = (0, mongoose_1.model)("Booking", BookingSchema);
