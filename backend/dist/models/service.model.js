"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ServiceSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        required: true,
        trim: true,
        default: "Sparkles",
    },
    color: {
        type: String,
        required: true,
        trim: true,
        default: "bg-blue-50 text-blue-600",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
// Ensure faster sorting by order
ServiceSchema.index({ order: 1, isActive: 1 });
exports.default = (0, mongoose_1.model)("Service", ServiceSchema);
