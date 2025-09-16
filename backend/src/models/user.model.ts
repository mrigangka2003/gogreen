import mongoose, { Document, Schema, Types } from "mongoose";
import Role, { IRole, RoleName } from "./role.model";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    role: Types.ObjectId | IRole;
    createdAt?: Date;
    updatedAt?: Date;

    // instance helper (works when role is populated)
    hasPermission?(permissionName: string): boolean;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
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
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
    },
    { timestamps: true }
);

/**
 * Instance helper: delegated permission check via populated role
 * Usage: await user.populate('role'); user.hasPermission('user.create');
 */
UserSchema.methods.hasPermission = function (
    this: IUser,
    permissionName: string
): boolean {
    if (!this.role) return false;
    // if role is populated, it has .hasPermission; otherwise false
    const role = this.role as IRole;
    if (typeof (role as any).hasPermission === "function") {
        return (role as any).hasPermission(permissionName);
    }
    // fallback: we could later implement direct DB check of role.permissions if not populated
    return false;
};

/**
 * Optional: pre('save') hook to hash password if you want model-level hashing.
 * If you're already hashing in controller via hashPassword util, skip this.
 *
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  // import a hash util or use bcrypt here (avoid circular import)
  this.password = await hashPassword(this.password);
  next();
});
*/

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
