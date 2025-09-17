
import mongoose, { Document, Schema, Types } from "mongoose";
import Permission, { IPermission } from "./permission.model";

export type RoleName = "user" | "org" | "emp" | "admin" | "super-admin";

export interface IRole extends Document {
    name: RoleName;
    description?: string;
    permissions: Types.ObjectId[] | IPermission[];
    createdAt?: Date;
    updatedAt?: Date;

    // instance helper (only works when permissions are populated)
    hasPermission?(permissionName: string): boolean;
}

const RoleSchema = new Schema<IRole>(
    {
        name: {
            type: String,
            enum: ["user", "org", "emp", "admin", "super-admin"],
            required: true,
            unique: true,
            index: true,
        },
        permissions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Permission",
            },
        ],
    },
    { timestamps: true }
);

/**
 * Instance method: check permission by name.
 * Requires `permissions` to be populated (or you can query permissions by id).
 */

RoleSchema.methods.hasPermission = function (this: IRole, permissionName: string): boolean {
    if (!this.permissions) return false;
    // if permissions populated, permission objects will have .name
    const perms = this.permissions as IPermission[];
    return perms.some((p) => (p as any).name === permissionName);
};

const Role = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
export default Role;
