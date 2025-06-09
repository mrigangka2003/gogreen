import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";

export const generateToken = (id: string, role: "user" | "admin"): string => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};
