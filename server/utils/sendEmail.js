import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        const response = await resend.emails.send({
            from: "Inventory App <noreply@onresend.com>",
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent successfully to ${to}`);
        return response;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw new Error("Email sending failed");
    }
};
