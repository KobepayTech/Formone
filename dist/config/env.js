"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000'),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    JWT_ACCESS_EXPIRY: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRY: zod_1.z.string().default('7d'),
    BCRYPT_ROUNDS: zod_1.z.string().default('12'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:5173'),
    MAX_FILE_SIZE: zod_1.z.string().default('10485760'),
    UPLOAD_PATH: zod_1.z.string().default('./uploads'),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map