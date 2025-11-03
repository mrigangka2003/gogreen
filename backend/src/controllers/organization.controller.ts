import { Request, Response } from "express";
import { success, z } from "zod";
import { apiError, apiResponse } from "../helper";

// import { AuthRequest } from "../middlewares/auth";
// import { apiError, apiResponse } from "../helper";
// import User from "../models/user.model";

//  Validation Schema
const ticketSchema = z.object({
    locality: z.string().min(2, "Locality is required!"),
    message: z.string().min(1, "Message is required!"),
});

const createSiteSchema = z.object({
    name: z.string().min(2, "Site name is required!"),
    locality: z.string().min(2, "Locality is required!"),
    city: z.string().min(2, "City is required!"),
    state: z.string().min(2, "State is required!"),
});

//  Controller Function
export const raiseTicket = async (req: Request, res: Response) => {
    try {
        //  Validate Request Body
        const ticketData = ticketSchema.safeParse(req.body);
        if (!ticketData.success) {
            return apiError(res, 422, "Invalid request body", ticketData.error);
        }

        const { locality, message } = ticketData.data;

        // const newTicket = await Ticket.create({
        //     locality,
        //     message,
        //     createdAt: new Date(),
        // });

        // ✅ Send Success Response
        return apiResponse(res, 200, "Ticket Raised Successfully", ticketData);
    } catch (error: any) {
        console.error("Error raising ticket:", error);
        return apiError(res, 500, "Internal Server Error", error);
    }
};

/* Create Site*/

const createSite = async (req: Request, res: Response) => {
    try {
        //  Validate input
        const siteData = createSiteSchema.safeParse(req.body);
        if (!siteData.success) {
            return apiError(res, 422, "Invalid request body", siteData.error);
        }

        const { name, locality, city, state } = siteData.data;

        //  Save to database
        // const newSite = await Site.create({
        //     name,
        //     locality,
        //     city,
        //     state,
        //     createdAt: new Date(),
        // });

        // ✅ Send success response
        return apiResponse(res, 201, "Site created successfully", siteData);
    } catch (error: any) {
        console.error("Error creating site:", error);
        return apiError(res, 500, "Internal Server Error", error);
    }
};

const editSite = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Allow partial updates
        const parsed = createSiteSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return apiError(res, 422, "Invalid request body", parsed.error);
        }

        const updatedData = parsed.data;

        // // If a new photo is uploaded
        // if (req.file) {
        //     updatedData.photo = `/uploads/sites/${req.file.filename}`;
        // }

        // const updatedSite = await Site.findByIdAndUpdate(id, updatedData, {
        //     new: true,
        // });
        //for now
        const updatedSite = true;

        if (!updatedSite) {
            return apiError(res, 404, "Site not found");
        }

        return apiResponse(res, 200, "Site updated successfully", updatedSite);
    } catch (error: any) {
        return apiError(res, 500, "Internal Server Error", error);
    }
};

// Delete Site
const deleteSite = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // const deletedSite = await Site.findByIdAndDelete(id);

        // if (!deletedSite) {
        //     return apiError(res, 404, "Site not found");
        // }

        return apiResponse(res, 200, "Site deleted successfully", "");
    } catch (error: any) {
        return apiError(res, 500, "Internal Server Error", error);
    }
};
