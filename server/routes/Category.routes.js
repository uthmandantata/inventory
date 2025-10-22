import express from "express";
import { addCategory, deleteCategory, editCategory, getCategory } from "../controllers/Category.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/add", authMiddleware, addCategory);
router.get("/", authMiddleware, getCategory);
router.put("/edit/:id", authMiddleware, editCategory);
router.delete("/delete/:id", authMiddleware, deleteCategory);


export default router;
