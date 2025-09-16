// src/middleware/validate.ts
import { ZodTypeAny } from "zod";
import { Request, Response, NextFunction } from "express";
import { apiError } from "../helper";

/**
 * validate(schema, target = 'body')
 * - schema: a zod schema
 * - target: 'body' | 'params' | 'query'
 *
 * Example: router.post('/register', validate(registerSchema), controller.register)
 */
export const validate =
    (schema: ZodTypeAny, target: "body" | "params" | "query" = "body") =>
    (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req[target] as any);
        if (!parsed.success) {
            apiError(res, 422, "Validation failed", parsed.error.format());
            return;
        }
        // replace request object with parsed data (helps types downstream)
        (req as any)[target] = parsed.data;
        next();
    };
