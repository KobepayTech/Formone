"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(422).json({ success: false, error: 'Validation failed', details: result.error.flatten() });
            return;
        }
        req.body = result.data;
        next();
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map