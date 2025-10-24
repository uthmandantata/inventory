import { Resend } from 'resend';

const resend = new Resend('re_huFuajFr_cuo1w6N2gSWPRkKq8a63dGTA');

export const sendEmail = async (to, subject, html) => {
    try {
        if (!to || !subject || !html) {
            console.error("❌ Email sending failed: Missing required parameters (to, subject, or html).");
            return; // Exit the function
        }

        await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [to],
            subject: "hello world",
            html: "<strong>it works!</strong>",
        });


        console.log(`✅ Email sent to ${to}`);
    } catch (err) {
        const errorMessage = err.message || JSON.stringify(err);
        console.error("❌ Email sending failed:", errorMessage);
    }
};




