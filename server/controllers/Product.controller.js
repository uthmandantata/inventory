import Product from "../models/Product.js";





export const addProduct = async (req, res) => {
    try {
        const {
            name,
            categoryId,
            supplierId,
            sku,
            description,
            unit,
            price,
            quantity,
            reorderLevel,
            maxStockLevel,
            batchNumber,
            expiryDate,
            location,
            notes,
            status
        } = req.body;

        const userId = req.user._id
        const productExists = await Product.findOne({ name });
        if (productExists) {
            return res.status(400).json({ success: false, message: "Product already exists!" });
        }
        const newProduct = new Product({
            name,
            categoryId,
            supplierId,
            sku,
            description,
            unit,
            price,
            quantity,
            reorderLevel,
            maxStockLevel,
            batchNumber,
            expiryDate,
            location,
            createdBy: userId,
            notes,
            status
        });
        await newProduct.save();
        return res.status(201).json({
            success: true,
            message: `Product "${newProduct.name}" added successfully.`,
            product: newProduct,
        });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({
            success: false,
            message: "Error in addProduct controller",
            error: error.message,
        });
    }
}

export const getProduct = async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId').populate('supplierId').populate('createdBy');
        return res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            success: false,
            message: "Error in getProduct controller",
            error: error.message,
        });
    }
}

export const editProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            name,
            categoryId,
            supplierId,
            sku,
            description,
            unit,
            price,
            quantity,
            reorderLevel,
            maxStockLevel,
            batchNumber,
            expiryDate,
            location,
            notes,
            status
        } = req.body;
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }
        productExists.name = name || productExists.name;
        productExists.categoryId = categoryId || productExists.categoryId;
        productExists.supplierId = supplierId || productExists.supplierId;
        productExists.sku = sku || productExists.sku;
        productExists.description = description || productExists.description;
        productExists.unit = unit || productExists.unit;
        productExists.price = price || productExists.price;
        productExists.quantity = quantity || productExists.quantity;
        productExists.reorderLevel = reorderLevel || productExists.reorderLevel;
        productExists.maxStockLevel = maxStockLevel || productExists.maxStockLevel;
        productExists.batchNumber = batchNumber || productExists.batchNumber;
        productExists.expiryDate = expiryDate || productExists.expiryDate;
        productExists.location = location || productExists.location;
        productExists.notes = notes || productExists.notes;
        productExists.status = status || productExists.status;
        await productExists.save();
        return res.status(200).json({
            success: true,
            message: `Product "${productExists.name}" updated successfully.`,
            product: productExists,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({
            success: false,
            message: "Error in editProduct controller",
            error: error.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }
        await Product.findByIdAndDelete(productId);
        return res.status(200).json({
            success: true,
            message: `Product "${productExists.name}" deleted successfully.`,
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({
            success: false,
            message: "Error in deleteProduct controller",
            error: error.message,
        });
    }
};