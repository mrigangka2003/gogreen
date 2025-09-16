import mongoose, { Schema, Document } from "mongoose";

export interface IPermission extends Document {
    code: string;
    description?: string;
}

const PermissionSchema = new Schema<IPermission>({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    description: {
        type: String,
    },
});

const Permission = mongoose.model<IPermission>("Permission", PermissionSchema);
export default Permission;
