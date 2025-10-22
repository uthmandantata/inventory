import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndCookies } from '../utils/generateTokensAndCookies.js';



export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }
        if (!userExists) {
            return res.status(404).json({ success: false, message: "User does not exist! Please register" });
        }
        const isMatch = await bcrypt.compare(password, userExists.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        if (userExists.isBanned) {
            return res.status(403).json({ success: false, message: "Your account is banned. Contact admin." });
        }
        const token = generateTokenAndCookies(res, userExists._id, userExists.role);


        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: userExists._id,
                username: userExists.username,
                role: userExists.role,
                email: userExists.email, // optional
            },
            token,
        });

    } catch (error) {
        console.error("Login Error:", error); // Add this for debugging
        res.status(500).json({
            success: false,
            message: "Error in Login Controller",
            error: error.message,
            stack: error.stack, // optional but helpful during dev
        });
    }
}

// export const register = async (req, res) => {
//     try {
//         const { username, email, password } = req.body;

//         const userExists = await User.findOne({ username });

//         if (!username || !email || !password) {
//             return res.status(400).json({ success: false, message: "All fields are required!" });
//         }
//         if (userExists) {
//             return res.status(400).json({ success: false, message: "User already exists! Login" });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({ username, email, password: hashedPassword });
//         await newUser.save();
//         return res.status(201).json({
//             success: true,
//             message: `User ${username} was created`,
//             user: { id: newUser._id, email: newUser.email, name: newUser.username }
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error in Register Controller", error: error.message });
//     }
// }

