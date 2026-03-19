"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raiseTicket = void 0;
const zod_1 = require("zod");
const helper_1 = require("../helper");
// import { AuthRequest } from "../middlewares/auth";
// import { apiError, apiResponse } from "../helper";
// import User from "../models/user.model";
//  Validation Schema
const ticketSchema = zod_1.z.object({
    locality: zod_1.z.string().min(2, "Locality is required!"),
    message: zod_1.z.string().min(1, "Message is required!"),
});
const createSiteSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Site name is required!"),
    locality: zod_1.z.string().min(2, "Locality is required!"),
    city: zod_1.z.string().min(2, "City is required!"),
    state: zod_1.z.string().min(2, "State is required!"),
});
//  Controller Function
const raiseTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  Validate Request Body
        const ticketData = ticketSchema.safeParse(req.body);
        if (!ticketData.success) {
            return (0, helper_1.apiError)(res, 422, "Invalid request body", ticketData.error);
        }
        const { locality, message } = ticketData.data;
        // const newTicket = await Ticket.create({
        //     locality,
        //     message,
        //     createdAt: new Date(),
        // });
        // ✅ Send Success Response
        return (0, helper_1.apiResponse)(res, 200, "Ticket Raised Successfully", ticketData);
    }
    catch (error) {
        console.error("Error raising ticket:", error);
        return (0, helper_1.apiError)(res, 500, "Internal Server Error", error);
    }
});
exports.raiseTicket = raiseTicket;
/* Create Site*/
const createSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //  Validate input
        const siteData = createSiteSchema.safeParse(req.body);
        if (!siteData.success) {
            return (0, helper_1.apiError)(res, 422, "Invalid request body", siteData.error);
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
        return (0, helper_1.apiResponse)(res, 201, "Site created successfully", siteData);
    }
    catch (error) {
        console.error("Error creating site:", error);
        return (0, helper_1.apiError)(res, 500, "Internal Server Error", error);
    }
});
const editSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Allow partial updates
        const parsed = createSiteSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return (0, helper_1.apiError)(res, 422, "Invalid request body", parsed.error);
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
            return (0, helper_1.apiError)(res, 404, "Site not found");
        }
        return (0, helper_1.apiResponse)(res, 200, "Site updated successfully", updatedSite);
    }
    catch (error) {
        return (0, helper_1.apiError)(res, 500, "Internal Server Error", error);
    }
});
// Delete Site
const deleteSite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // const deletedSite = await Site.findByIdAndDelete(id);
        // if (!deletedSite) {
        // }
        return (0, helper_1.apiResponse)(res, 200, "Site deleted successfully", "");
    }
    catch (error) {
        return (0, helper_1.apiError)(res, 500, "Internal Server Error", error);
    }
});
