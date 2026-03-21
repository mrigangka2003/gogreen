"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.Role = exports.Review = exports.Permission = exports.User = exports.Booking = void 0;
const booking_model_1 = __importDefault(require("./booking.model"));
exports.Booking = booking_model_1.default;
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
const permission_model_1 = __importDefault(require("./permission.model"));
exports.Permission = permission_model_1.default;
const review_model_1 = __importDefault(require("./review.model"));
exports.Review = review_model_1.default;
const role_model_1 = __importDefault(require("./role.model"));
exports.Role = role_model_1.default;
const service_model_1 = __importDefault(require("./service.model"));
exports.Service = service_model_1.default;
