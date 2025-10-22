import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addSupplier, deleteSupplier, editSupplier, getSupplier } from "../controllers/Supplier.controller.js";


const router = express.Router();



router.post("/add", authMiddleware, addSupplier);
router.get("/", authMiddleware, getSupplier);
router.put("/edit/:id", authMiddleware, editSupplier);
router.delete("/delete/:id", authMiddleware, deleteSupplier);


export default router;
