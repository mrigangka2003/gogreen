import { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../../models/user.model";
import { apiError, apiResponse } from "../../helper";
import { hashPassword, generateToken } from "../../utils";

const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return apiError(res, 400, "User already exists");
        }

        const hashed = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role: "user",
        });

        const token = generateToken(user._id.toString(), "user");

        return apiResponse(res, 201, "User registered successfully", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: "user",
            },
        });
    } catch (error) {
        return apiError(res, 500, "User registration failed", error);
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return apiError(res, 404, "User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return apiError(res, 401, "Invalid credentials");

        const token = generateToken(user._id.toString(), "user");

        return apiResponse(res, 200, "User login successful", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: "user",
            },
        });
    } catch (error) {
        return apiError(res, 500, "User login failed", error);
    }
};

export { registerUser, loginUser };
