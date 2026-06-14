"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTicketGeneratedEmail = exports.sendPaymentConfirmationEmail = exports.sendOTPEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("../config/logger");
const transporter = process.env.SMTP_HOST
    ? nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    : null;
const sendEmail = async (to, subject, html) => {
    if (!transporter) {
        logger_1.logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`);
        return;
    }
    await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
};
exports.sendEmail = sendEmail;
const sendOTPEmail = async (to, otp) => {
    await (0, exports.sendEmail)(to, 'Your EduResult Pro Verification Code', `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`);
};
exports.sendOTPEmail = sendOTPEmail;
const sendPaymentConfirmationEmail = async (to, d) => {
    await (0, exports.sendEmail)(to, 'Payment Confirmed', `<h2>Payment Confirmed!</h2><p>${d.amount} TZS for ${d.studentName}</p><p>Schools: ${d.schools.join(', ')}</p>`);
};
exports.sendPaymentConfirmationEmail = sendPaymentConfirmationEmail;
const sendTicketGeneratedEmail = async (to, d) => {
    await (0, exports.sendEmail)(to, 'Interview Scheduled', `<h2>Interview Scheduled</h2><p>${d.studentName} at ${d.schoolName} on ${d.interviewDate}</p>`);
};
exports.sendTicketGeneratedEmail = sendTicketGeneratedEmail;
//# sourceMappingURL=email.js.map