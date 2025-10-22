import bcrypt from 'bcrypt';
import User from './models/User.js';

import { dbConnect } from './config/db.js';

export const register = async (req, res) => {
    try {
        dbConnect();
        const hashedPassword = await bcrypt.hash("password", 10);
        const newUser = new User({ username: "admin", email: "admin@admin.com", password: hashedPassword, role: "admin" });
        await newUser.save();
        return res.status(201).json({
            success: true,
            message: `User ${username} was created`,
            user: { id: newUser._id, email: newUser.email, name: newUser.username }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in Register Controller in seed.js", error: error.message });
    }
}