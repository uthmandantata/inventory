import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
    try {
        const user = await User.find();
        return res.status(201).json({
            success: true,
            users: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in getUser Controller", error: error.message });
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authMiddleware sets req.user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            user: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in getCurrentUser Controller", error: error.message });
    }
}

export const editMyProfile = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authMiddleware sets req.user
        const { username, email, address } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { username, email, address },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in editMyProfile Controller", error: error.message });
    }
}

export const createUser = async (req, res) => {
    try {
        const { username, email, address, role } = req.body;
        const newUser = new User({ username, email, address, role });
        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // const link = `${process.env.FRONTEND_URL}/api/users/set-password/?token=${token}`;

        // const html = `
        //     <h1>Welcome to Our Platform</h1>
        //     <p>Please set your password by clicking the link below:</p>
        //     <a href="${link}">Set Password</a>
        // `;
        // await sendEmail(email, "Set Up Your Password", html);

        return res.status(201).json({
            success: true,
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in createUser Controller", error: error.message });
    }
}

export const setUserPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // 1️⃣ Check for missing fields
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and password are required",
            });
        }

        // 2️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3️⃣ Find user by decoded userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid or expired token" });
        }

        // 4️⃣ Hash new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // 5️⃣ Respond
        return res.status(200).json({
            success: true,
            message: "Password set successfully. You can now log in.",
        });
    } catch (error) {
        console.error("Error in setUserPassword:", error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({
                success: false,
                message: "Link expired. Request a new password setup email.",
            });
        }
        res.status(500).json({
            success: false,
            message: "Error in setUserPassword Controller",
            error: error.message,
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in deleteUser Controller", error: error.message });
    }
}