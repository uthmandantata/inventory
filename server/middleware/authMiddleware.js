import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const authMiddleware = async (req, res, next) => {
    try {
        console.log("Headers received:", req.headers); // 👈 ADD THIS LINE

        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }

        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!decode) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const user = await User.findById(decode.userId || decode.id).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized, token failed", error: error.message });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied. Admins only." });
    }
    next();
};