import { Resend } from 'resend';

export const sendEmail = async (to, subject, html) => {
    try {
        const resend = new Resend('re_huFuajFr_cuo1w6N2gSWPRkKq8a63dGTA');

        resend.emails.send({
            from: `"Your Company" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html
        });

        console.log(`✅ Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email sending failed:", err.message);
    }
};




