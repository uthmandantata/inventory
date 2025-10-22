import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addProduct, deleteProduct, editProduct, getProduct } from "../controllers/Product.controller.js";
const router = express.Router();



router.post("/add", authMiddleware, addProduct);
router.get("/", authMiddleware, getProduct);
router.put("/edit/:id", authMiddleware, editProduct);
router.delete("/delete/:id", authMiddleware, deleteProduct);


export default router;
