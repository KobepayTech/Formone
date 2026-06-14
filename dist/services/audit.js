"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = void 0;
const database_1 = require("../config/database");
const logAudit = async (userId, action, entityType, entityId, details, ip, ua) => {
    await database_1.prisma.auditLog.create({ data: { userId, action, entityType, entityId, details: details || {}, ipAddress: ip, userAgent: ua } });
};
exports.logAudit = logAudit;
//# sourceMappingURL=audit.js.map