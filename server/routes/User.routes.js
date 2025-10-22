import express from "express";
import { adminOnly, authMiddleware } from "../middleware/authMiddleware.js";
import { getAllUsers, getCurrentUser, editMyProfile, createUser, setUserPassword } from "../controllers/User.controller.js";


const router = express.Router();

router.get("/", authMiddleware, adminOnly, getAllUsers);
router.put("/edit-profile", authMiddleware, editMyProfile);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/create-user", authMiddleware, adminOnly, createUser);
router.post("/set-password/", setUserPassword);

export default router;
