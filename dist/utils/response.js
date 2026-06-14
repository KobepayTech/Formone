"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginated = exports.created = exports.success = void 0;
const success = (res, data, message, meta) => {
    return res.status(200).json({ success: true, data, message, meta });
};
exports.success = success;
const created = (res, data, message) => {
    return res.status(201).json({ success: true, data, message });
};
exports.created = created;
const paginated = (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return (0, exports.success)(res, data, undefined, { page, limit, total, totalPages });
};
exports.paginated = paginated;
//# sourceMappingURL=response.js.map