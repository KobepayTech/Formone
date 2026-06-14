"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL, credentials: true }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(env_1.env.UPLOAD_PATH));
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'EduResult Pro API v2.0', version: '2.0.0', timestamp: new Date().toISOString() });
});
const routes_1 = __importDefault(require("./routes"));
app.use('/api/v2', routes_1.default);
app.use(errorHandler_1.errorHandler);
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});
exports.default = app;
//# sourceMappingURL=app.js.map