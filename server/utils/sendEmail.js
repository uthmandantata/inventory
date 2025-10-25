import axios from "axios";

export const sendEmail = async (to, subject, html) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: { name: "Inventory App", email: process.env.BREVO_USER },
                to: [{ email: to }],
                subject,
                htmlContent: html,
            },
            {
                headers: {
                    "api-key": process.env.BREVO_PASS,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        console.log(`✅ Email sent successfully to ${to}`);
        return response.data;
    } catch (error) {
        console.error(
            "❌ Error sending email:",
            error.response?.data || error.message
        );
        throw new Error("Email sending failed");
    }
};