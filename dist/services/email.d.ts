export declare const sendEmail: (to: string, subject: string, html: string) => Promise<void>;
export declare const sendOTPEmail: (to: string, otp: string) => Promise<void>;
export declare const sendPaymentConfirmationEmail: (to: string, d: {
    studentName: string;
    amount: number;
    schools: string[];
}) => Promise<void>;
export declare const sendTicketGeneratedEmail: (to: string, d: {
    studentName: string;
    schoolName: string;
    interviewDate: string;
}) => Promise<void>;
