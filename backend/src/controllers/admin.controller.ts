import { Response } from "express";

import { apiError, apiResponse } from "../helper";
import Booking from "../models/booking.model";
import User from "../models/user.model";
import { AuthRequest } from "../middlewares/authMiddleware";



export const getAllUserBookings = async (req: AuthRequest, res: Response):Promise<void> => {
    if (req.user?.role !== "admin") {
        apiError(res, 403, "Access denied");
        return;
    }

    try {
        const bookings = await Booking.find().populate(
            "user",
            "name email phone"
        ).sort({ createdAt: -1 }); 
        ;
        apiResponse(res, 200, "All bookings fetched", bookings);
    } catch (error) {
        apiError(res, 500, "Failed to fetch bookings", error);
    }
};
export const getAllOrgBookings = async (req: AuthRequest, res: Response):Promise<void> => {
    if (req.user?.role !== "admin") {
        apiError(res, 403, "Access denied");
        return;
    }

    try {
        const bookings = await Booking.find().populate(
            "org",
            "name email phone"
        ).sort({ createdAt: -1 }); 
        ;
        apiResponse(res, 200, "All bookings fetched", bookings);
    } catch (error) {
        apiError(res, 500, "Failed to fetch bookings", error);
    }
};



export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        apiError(res, 403, "Access denied");
        return;
    }

    try {
        const users = await User.find({ role: "user" });
        apiResponse(res, 200, "All users fetched", users);
    } catch (error) {
        apiError(res, 500, "Failed to fetch users", error);
    }
};


export const getAllOrg = async (req: AuthRequest, res: Response): Promise<void> => {
    if (req.user?.role !== "admin") {
        apiError(res, 403, "Access denied");
        return;
    }

    try {
        const users = await User.find({ role: "organization" });
        apiResponse(res, 200, "All users fetched", users);
    } catch (error) {
        apiError(res, 500, "Failed to fetch users", error);
    }
};
