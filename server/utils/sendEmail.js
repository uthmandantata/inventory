import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // use TLS
            auth: {
                user: "focalleap@gmail.com", // e.g. yourname@gmail.com
                pass: "xsmtpsib-a67ebf58964bf5ee5771009b35538a83baf7620672c84215a8a5d170996f3382-p9ox1GHyDBuWGMq5", // your Brevo SMTP key
            },
        });

        await transporter.sendMail({
            from: `"Inventory App" focalleap@gmail.com`,
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
