import mongoose, { Schema } from "mongoose";

export interface IAdmin {
    name: string;
    email: string;
    password: string;
    role: "admin";
    createdAt: Date;
    phone?: string;
}

const AdminSchema = new Schema<IAdmin>(
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
        role: {
            type: String,
            enum: ["admin"],
            default: "admin",
        },
        phone: {
            type: String,
        },
    },
    { timestamps: true }
);

const Admin = mongoose.model<IAdmin>("Admin",AdminSchema);
export default Admin;

