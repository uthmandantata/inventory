import Category from "../models/Category.js";




export const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user not found in request.",
            });
        }
        const userId = req.user._id;

        if (!name || !description) {
            return res.status(400).json({ success: false, message: "All fields are required!" });
        }
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            return res.status(400).json({ success: false, message: "Category already exists! Login" });
        }

        const newCategory = new Category({ name, description, createdBy: userId });
        await newCategory.save();
        return res.status(201).json({
            success: true,
            message: `Category ${name} was created`,
            category: newCategory
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in addCategory Controller", error: error.message });
    }
}

export const getCategory = async (req, res) => {
    try {
        const category = await Category.find();
        return res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error in getCategory Controller", error: error.message });
    }
}


export const editCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description } = req.body;
        const userId = req.user._id

        const categoryExists = await Category.findById(categoryId);

        if (!categoryExists) {
            return res.status(404).json({ success: false, message: "Category not found!" });
        }

        // Optional: Make sure only the creator can edit
        // if (categoryExists.createdBy.toString() !== userId.toString()) {
        //     return res.status(403).json({ success: false, message: "You are not authorized to edit this category." });
        // }

        // Update fields
        categoryExists.name = name || categoryExists.name;
        categoryExists.description = description || categoryExists.description;

        // Save updates
        const updatedCategory = await categoryExists.save();

        return res.status(200).json({
            success: true,
            message: `Category "${updatedCategory.name}" was updated successfully.`,
            category: updatedCategory,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({
            success: false,
            message: "Error in editCategory controller",
            error: error.message,
        });
    }
};


export const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const categoryExists = await Category.findById(categoryId);

        if (!categoryExists) {
            return res.status(404).json({ success: false, message: "Category not found!" });
        }

        await Category.findByIdAndDelete(categoryId);

        return res.status(200).json({
            success: true,
            message: `Category "${categoryExists.name}" was deleted successfully.`,
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            success: false,
            message: "Error in deleteCategory controller",
            error: error.message,
        });
    }
};