import mongoose, { Schema, model, Document } from "mongoose";

export interface IService extends Document {
    title: string;
    description: string;
    icon: string; // Lucide icon name key e.g. "Sparkles", "Trash2"
    color: string; // Tailwind classes e.g. "bg-blue-50 text-blue-600"
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
    {
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
    },
    { timestamps: true }
);

// Ensure faster sorting by order
ServiceSchema.index({ order: 1, isActive: 1 });

export default model<IService>("Service", ServiceSchema);
