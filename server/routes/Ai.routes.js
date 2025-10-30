import express from "express";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { query } = req.body;

  try {
    let answer = "Sorry, I couldn’t understand your question.";

    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("total products") || lowerQuery.includes("how many products")) {
      const count = await Product.countDocuments();
      answer = `You currently have ${count} products in inventory.`;
    }
    else if (lowerQuery.includes("suppliers")) {
      const count = await Supplier.countDocuments();
      answer = `There are ${count} registered suppliers.`;
    }
    else if (lowerQuery.includes("low stock")) {
      const lowStock = await Product.find({ quantity: { $lt: 10 } });
      answer = `You have ${lowStock.length} products running low on stock.`;
    }
    else if (lowerQuery.includes("categories")) {
      const count = await Category.countDocuments();
      answer = `There are ${count} product categories in your system.`;
    }

    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error answering question", error });
  }
});

export default router;
