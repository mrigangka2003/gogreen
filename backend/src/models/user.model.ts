import mongoose, { Schema } from "mongoose";

interface IUser {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    phone?: string;
    address?: string;
    isActive: boolean;
    createdAt: Date;
}


const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        role: {
            type: String,
            enum: ["user", "admin","organization"],
            default: "user",
        },
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
