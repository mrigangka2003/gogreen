import mongoose, { Schema, Document } from "mongoose";
import { IRole } from "./Role.models";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    role: mongoose.Types.ObjectId | IRole;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        address: { type: String },
        isActive: { type: Boolean, default: true },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
