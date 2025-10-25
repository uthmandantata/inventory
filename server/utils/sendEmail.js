import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // use TLS
            auth: {
                user: process.env.BREVO_USER, // e.g. yourname@gmail.com
                pass: process.env.BREVO_PASS, // your Brevo SMTP key
            },
        });

        await transporter.sendMail({
            from: `"Inventory App" <${process.env.BREVO_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        throw new Error("Email sending failed");
    }
};
