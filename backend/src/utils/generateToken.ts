import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { IRole } from "../models/role.model";

export const generateToken = (id: string, role: IRole): string => {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};


