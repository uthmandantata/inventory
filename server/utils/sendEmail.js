import { Resend } from 'resend';

export const sendEmail = async (to, subject, html) => {
    try {
        const resend = new Resend('re_huFuajFr_cuo1w6N2gSWPRkKq8a63dGTA');

        await resend.emails.send({
            from: "Your Company <onboarding@resend.dev>", // ✅ Correct quote structure
            to,
            subject,
            html,
        });


        console.log(`✅ Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email sending failed:", err.message);
    }
};




