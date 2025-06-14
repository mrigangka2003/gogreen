import mongoose, { Schema } from "mongoose";

interface IUser {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    phone?: string;
    address?: string;
    isActive: boolean;
    bookings: mongoose.Types.ObjectId[]; 
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
        address: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        
        bookings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
        }],
    },
    { timestamps: true }
);

const User = mongoose.model<IUser>("User", UserSchema);
export default User;