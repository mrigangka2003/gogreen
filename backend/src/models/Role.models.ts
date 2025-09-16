import mongoose from "mongoose";
import { IPermission } from "./permission.model";

export interface IRole extends Document {
    name: "user" | "org" | "emp" | "admin" | "super-admin";
    permissions: mongoose.Types.ObjectId[] | IPermission[];
}

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "org", "emp", "admin", "super-admin"],
        required: true,
        unique: true,
        index: true
    },
    permissions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Permission"
        }
    ],

});

const Role = mongoose.model<IRole>("Role", roleSchema);
export default Role;