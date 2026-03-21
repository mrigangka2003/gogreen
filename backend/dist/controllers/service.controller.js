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
const models_1 = require("../models");
const helper_1 = require("../helper");
/**
 * GET /admin/services or /super/services
 * Public — returns all active services sorted by order
 */
const getServices = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield models_1.Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        (0, helper_1.apiResponse)(res, 200, "Services fetched", services);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch services", err);
    }
});
/**
 * GET /admin/services/all  (admin panel — includes inactive)
 */
const getAllServices = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield models_1.Service.find().sort({ order: 1, createdAt: 1 });
        (0, helper_1.apiResponse)(res, 200, "All services fetched", services);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to fetch services", err);
    }
});
/**
 * POST /admin/services
 * Create a new service
 */
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, icon, color, order } = req.body;
        if (!title || !description || !icon || !color) {
            (0, helper_1.apiError)(res, 400, "title, description, icon, and color are required");
            return;
        }
        const service = yield models_1.Service.create({
            title: title.trim(),
            description: description.trim(),
            icon: icon.trim(),
            color: color.trim(),
            order: order !== null && order !== void 0 ? order : 0,
            isActive: true,
        });
        (0, helper_1.apiResponse)(res, 201, "Service created", service);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to create service", err);
    }
});
/**
 * PATCH /admin/services/:id
 * Update a service
 */
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, icon, color, isActive, order } = req.body;
        const service = yield models_1.Service.findById(id);
        if (!service) {
            (0, helper_1.apiError)(res, 404, "Service not found");
            return;
        }
        if (title !== undefined)
            service.title = title.trim();
        if (description !== undefined)
            service.description = description.trim();
        if (icon !== undefined)
            service.icon = icon.trim();
        if (color !== undefined)
            service.color = color.trim();
        if (isActive !== undefined)
            service.isActive = isActive;
        if (order !== undefined)
            service.order = order;
        yield service.save();
        (0, helper_1.apiResponse)(res, 200, "Service updated", service);
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to update service", err);
    }
});
/**
 * DELETE /admin/services/:id
 * Delete a service
 */
const deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield models_1.Service.findByIdAndDelete(id);
        if (!deleted) {
            (0, helper_1.apiError)(res, 404, "Service not found");
            return;
        }
        (0, helper_1.apiResponse)(res, 200, "Service deleted", {});
    }
    catch (err) {
        (0, helper_1.apiError)(res, 500, "Failed to delete service", err);
    }
});
exports.default = {
    getServices,
    getAllServices,
    createService,
    updateService,
    deleteService,
};
