import { Request, Response } from "express";
import { Service } from "../models";
import { apiError, apiResponse } from "../helper";

/**
 * GET /admin/services or /super/services
 * Public — returns all active services sorted by order
 */
const getServices = async (_req: Request, res: Response): Promise<void> => {
    try {
        const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        apiResponse(res, 200, "Services fetched", services);
    } catch (err) {
        apiError(res, 500, "Failed to fetch services", err);
    }
};

/**
 * GET /admin/services/all  (admin panel — includes inactive)
 */
const getAllServices = async (_req: Request, res: Response): Promise<void> => {
    try {
        const services = await Service.find().sort({ order: 1, createdAt: 1 });
        apiResponse(res, 200, "All services fetched", services);
    } catch (err) {
        apiError(res, 500, "Failed to fetch services", err);
    }
};

/**
 * POST /admin/services
 * Create a new service
 */
const createService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, icon, color, order } = req.body;

        if (!title || !description || !icon || !color) {
            apiError(res, 400, "title, description, icon, and color are required");
            return;
        }

        const service = await Service.create({
            title: title.trim(),
            description: description.trim(),
            icon: icon.trim(),
            color: color.trim(),
            order: order ?? 0,
            isActive: true,
        });

        apiResponse(res, 201, "Service created", service);
    } catch (err) {
        apiError(res, 500, "Failed to create service", err);
    }
};

/**
 * PATCH /admin/services/:id
 * Update a service
 */
const updateService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, icon, color, isActive, order } = req.body;

        const service = await Service.findById(id);
        if (!service) {
            apiError(res, 404, "Service not found");
            return;
        }

        if (title !== undefined) service.title = title.trim();
        if (description !== undefined) service.description = description.trim();
        if (icon !== undefined) service.icon = icon.trim();
        if (color !== undefined) service.color = color.trim();
        if (isActive !== undefined) service.isActive = isActive;
        if (order !== undefined) service.order = order;

        await service.save();
        apiResponse(res, 200, "Service updated", service);
    } catch (err) {
        apiError(res, 500, "Failed to update service", err);
    }
};

/**
 * DELETE /admin/services/:id
 * Delete a service
 */
const deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await Service.findByIdAndDelete(id);
        if (!deleted) {
            apiError(res, 404, "Service not found");
            return;
        }
        apiResponse(res, 200, "Service deleted", {});
    } catch (err) {
        apiError(res, 500, "Failed to delete service", err);
    }
};

export default {
    getServices,
    getAllServices,
    createService,
    updateService,
    deleteService,
};
