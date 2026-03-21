"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
}, { timestamps: true });
/**
 * Instance helper: delegated permission check via populated role
 * Usage: await user.populate('role'); user.hasPermission('user.create');
 */
UserSchema.methods.hasPermission = function (permissionName) {
    if (!this.role)
        return false;
    // if role is populated, it has .hasPermission; otherwise false
    const role = this.role;
    if (typeof role.hasPermission === "function") {
        return role.hasPermission(permissionName);
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
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
