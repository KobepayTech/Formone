"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketQR = exports.generateUniversalStudentQR = exports.generateQRCode = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const generateQRCode = async (data, opts) => qrcode_1.default.toDataURL(data, { width: 512, margin: 2, color: { dark: '#1E3A5F', light: '#FFFFFF' }, ...opts });
exports.generateQRCode = generateQRCode;
const generateUniversalStudentQR = async (studentId) => (0, exports.generateQRCode)(JSON.stringify({ v: '2.0', type: 'universal_student', id: studentId, ts: Date.now() }));
exports.generateUniversalStudentQR = generateUniversalStudentQR;
const generateTicketQR = async (ticketNum, schoolCode) => (0, exports.generateQRCode)(JSON.stringify({ v: '2.0', type: 'interview_ticket', ticket: ticketNum, school: schoolCode, ts: Date.now() }), { width: 256 });
exports.generateTicketQR = generateTicketQR;
//# sourceMappingURL=qr.js.map