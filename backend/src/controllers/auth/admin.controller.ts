import { Request, Response } from "express";
import bcrypt from "bcrypt"

import Admin from "../../models/admin.model";
import { apiError, apiResponse } from "../../helper";
import { hashPassword, generateToken } from "../../utils";

const registerAdmin = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone } = req.body;
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return apiError(res, 400, "User already exists");
        }

        const hashed = await hashPassword(password);
        const admin = await Admin.create({
            name,
            email,
            password: hashed,
            phone,
            role: "Admin",
        });

        const token = generateToken(admin._id.toString(), "admin");

        return apiResponse(res, 201, "Admin registered successfully", {
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: "admin",
            },
        });
    } catch (error) {
        return apiError(res, 500, "Admin registration failed", error);
    }
};

const loginAdmin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) return apiError(res, 404, "Admin not found");

        const isMatch = await bcrypt.compare(password,admin.password);
        if (!isMatch) return apiError(res, 401, "Invalid credentials");

        const token = generateToken(admin._id.toString(), "admin");

        return apiResponse(res, 200, "Admin login successful", {
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: "admin",
            },
        });
    } catch (error) {
        return apiError(res, 500, "Admin login failed", error);
    }
};


export {
    registerAdmin,
    loginAdmin
}
