"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const helper_1 = require("../helper");
/**
 * validate(schema, target = 'body')
 * - schema: a zod schema
 * - target: 'body' | 'params' | 'query'
 *
 * Example: router.post('/register', validate(registerSchema), controller.register)
 */
const validate = (schema, target = "body") => (req, res, next) => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
        (0, helper_1.apiError)(res, 422, "Validation failed", parsed.error.format());
        return;
    }
    // replace request object with parsed data (helps types downstream)
    req[target] = parsed.data;
    next();
};
exports.validate = validate;
