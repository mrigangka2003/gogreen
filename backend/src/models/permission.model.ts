import mongoose, { Document, Schema } from "mongoose";

export interface IPermission extends Document {
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const PermissionSchema = new Schema<IPermission>(
    {
        name: { type: String, required: true, unique: true, index: true },
        description: { type: String, default: "" },
    },
    { timestamps: true }
);

const Permission =
    mongoose.models.Permission ||
    mongoose.model<IPermission>("Permission", PermissionSchema);

export default Permission;
