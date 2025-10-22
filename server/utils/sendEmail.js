import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // or your mail provider
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER, // your email
                pass: process.env.EMAIL_PASS, // your app password
            },
        });

        await transporter.sendMail({
            from: `"Your Company" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent to ${to}`);
    } catch (err) {
        console.error("❌ Email sending failed:", err.message);
    }
};
