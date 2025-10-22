import express from "express";
import { login } from "../controllers/Auth.controller.js";
// import { isGuest } from "../middleware/protect.js";

const router = express.Router();

router.post("/login", login);



export default router;
