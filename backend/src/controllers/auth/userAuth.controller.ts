import { Request, Response } from "express";
import bcrypt from "bcrypt";

import User from "../../models/user.model";
import { apiError, apiResponse } from "../../helper";
import { hashPassword, generateToken } from "../../utils";

const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            apiError(res, 400, "User already exists");
            return;
        }

        const hashed = await hashPassword(password);

        const user = await User.create({
            name,
            email,
            password: hashed,
            phone,
            role,
        });

        const token = generateToken(user._id.toString(), role);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        apiResponse(res, 201, "registered successfully", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: role,
            },
        });
    } catch (error) {
        apiError(res, 500, "registration failed", error);
    }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            apiError(res, 404, "User not found");
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            apiError(res, 401, "Invalid credentials");
            return;
        }

        const token = generateToken(user._id.toString(), user.role);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        apiResponse(res, 200, "login successful", {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        apiError(res, 500, "login failed", error);
    }
};

export { registerUser, loginUser };
