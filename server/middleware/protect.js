import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        }
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decode.userId).select("-password");

        if (!req.user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }


        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Not authorized, token failed", error: error.message });
    }
};
export const isAdmin = async (req, res, next) => {
    try {

        if (req.user && req.user.role === "admin") {
            return next();
        }
        return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Auth error", error: error.message });
    }
};


export const isGuest = async (req, res, next) => {
    try {
        let token;

        if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        }
        if (!token) {
            return next();
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decode.userId).select("-password");

        if (req.user) {
            return res.status(403).json({ success: false, message: "Already logged in. Loggout to access this route" });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: "Auth error", error: error.message });
    }
};



