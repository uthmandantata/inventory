import express from "express";
import { login, register } from "../controllers/Auth.controller.js";
// import { isGuest } from "../middleware/protect.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);



export default router;
