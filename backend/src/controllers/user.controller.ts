import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { apiResponse, apiError } from "../helper";
import Booking from "../models/booking.model";

const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {

    if(req.user?.role!=="user"){
        apiError(res, 403, "Only users can create bookings");
        return ;
    }

    try {
        const { date, time, address } = req.body;
        const userId = req.user?._id; 

        if (!date || !time || !address) {
            apiError(res, 400, "Date, time, and address are required");
            return;
        }

        const newBooking = new Booking({
            user: userId,
            date,
            time,
            address,
            status: "pending",
        });

        await newBooking.save();

        apiResponse(res, 201, "Booking Successfully Created", newBooking);
    } catch (error) {
        apiError(res, 500, "Failed to create booking", error);
    }
};

export { createBooking };
