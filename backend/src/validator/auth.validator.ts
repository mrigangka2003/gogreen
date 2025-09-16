
import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    role: z.union([z.string(), z.undefined()]).optional(),
});


export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
