import QRCode from 'qrcode';
export declare const generateQRCode: (data: string, opts?: QRCode.QRCodeToDataURLOptions) => Promise<string>;
export declare const generateUniversalStudentQR: (studentId: string) => Promise<string>;
export declare const generateTicketQR: (ticketNum: string, schoolCode: string) => Promise<string>;
