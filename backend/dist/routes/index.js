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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Routes
const user_routes_1 = __importDefault(require("./user.routes"));
const emp_routes_1 = __importDefault(require("./emp.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const superAdmin_routes_1 = __importDefault(require("./superAdmin.routes"));
// Auth controllers
const auth_controller_1 = __importStar(require("../controllers/auth/auth.controller"));
// Middleware
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * 🔐 Auth routes
 */
router.post("/signup", auth_controller_1.default.register);
router.post("/login", auth_controller_1.default.login);
router.post("/logout", auth_1.authMiddleware, auth_controller_1.default.logout);
router.post("/create-admin", auth_controller_1.adminRegister);
/**
 *  User/Org routes (user and org share the same routes/permissions)
 */
router.use("/user", user_routes_1.default);
router.use("/org", user_routes_1.default); // reuse user routes for org role
/**
 *  Employee routes
 */
router.use("/emp", emp_routes_1.default);
/**
 *  Admin routes
 */
router.use("/admin", admin_routes_1.default);
/**
 * Super Admin routes
 */
router.use("/super", superAdmin_routes_1.default);
exports.default = router;
