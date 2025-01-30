// pages/api/send-admin-alert.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export interface AdminAlertBody {
    userEmail: string;
    timestamp: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userEmail, timestamp } = req.body as AdminAlertBody;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
            subject: 'ניסיון גישה לממשק ניהול',
            text: `ניסיון גישה לממשק הניהול התקבל:
            משתמש: ${userEmail}
            זמן: ${new Date(timestamp).toLocaleString('he-IL')}`,
            html: `
                <div dir="rtl">
                    <h2>ניסיון גישה לממשק הניהול</h2>
                    <p><strong>משתמש:</strong> ${userEmail}</p>
                    <p><strong>זמן:</strong> ${new Date(timestamp).toLocaleString('he-IL')}</p>
                </div>
            `
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending admin alert:', error);
        res.status(500).json({ success: false, error: 'Failed to send alert' });
    }
}