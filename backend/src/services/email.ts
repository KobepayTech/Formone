import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) { logger.info(`[Email Mock] To: ${to} | Subject: ${subject}`); return; }
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
};

export const sendOTPEmail = async (to: string, otp: string) => {
  await sendEmail(to, 'Your EduResult Pro Verification Code', `<p>Your OTP is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`);
};

export const sendPaymentConfirmationEmail = async (to: string, d: { studentName: string; amount: number; schools: string[] }) => {
  await sendEmail(to, 'Payment Confirmed', `<h2>Payment Confirmed!</h2><p>${d.amount} TZS for ${d.studentName}</p><p>Schools: ${d.schools.join(', ')}</p>`);
};

export const sendTicketGeneratedEmail = async (to: string, d: { studentName: string; schoolName: string; interviewDate: string }) => {
  await sendEmail(to, 'Interview Scheduled', `<h2>Interview Scheduled</h2><p>${d.studentName} at ${d.schoolName} on ${d.interviewDate}</p>`);
};
