import QRCode from 'qrcode';

export const generateQRCode = async (data: string, opts?: QRCode.QRCodeToDataURLOptions) =>
  QRCode.toDataURL(data, { width: 512, margin: 2, color: { dark: '#1E3A5F', light: '#FFFFFF' }, ...opts });

export const generateUniversalStudentQR = async (studentId: string) =>
  generateQRCode(JSON.stringify({ v: '2.0', type: 'universal_student', id: studentId, ts: Date.now() }));

export const generateTicketQR = async (ticketNum: string, schoolCode: string) =>
  generateQRCode(JSON.stringify({ v: '2.0', type: 'interview_ticket', ticket: ticketNum, school: schoolCode, ts: Date.now() }), { width: 256 });
