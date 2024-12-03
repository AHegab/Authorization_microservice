import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        service: 'Gmail', // Use your email provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Personal Finance Tracker" <no-reply@authservice-production-8efe.up.railway.app>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this reset, please ignore this email.</p>
        `,
        });
    }
}
