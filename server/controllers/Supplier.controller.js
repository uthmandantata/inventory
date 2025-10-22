import Supplier from "../models/Supplier.js";





export const addSupplier = async (req, res) => {
    try {
        const { name, contactInfo, address } = req.body;
        const userId = req.user._id

        const supplierExists = await Supplier.findOne({ name });
        if (supplierExists) {
            return res.status(400).json({ success: false, message: "Supplier already exists!" });
        }
        const newSupplier = new Supplier({
            name,
            contactInfo,
            address,
            createdBy: userId,
        });
        await newSupplier.save();

        return res.status(201).json({
            success: true,
            message: `Supplier "${newSupplier.name}" added successfully.`,
            supplier: newSupplier,
        });

    } catch (error) {
        console.error("Error adding supplier:", error);
        res.status(500).json({
            success: false,
            message: "Error in addSupplier controller",
            error: error.message,
        });
    }
}

export const getSupplier = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        return res.status(200).json({ success: true, suppliers });

    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({
            success: false,
            message: "Error in getSupplier controller",
            error: error.message,
        });
    }
}


export const editSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const { name, contactInfo, address } = req.body;

        const supplierExists = await Supplier.findById(supplierId);
        if (!supplierExists) {
            return res.status(404).json({ success: false, message: "Supplier not found!" });
        }
        supplierExists.name = name || supplierExists.name;
        supplierExists.contactInfo = contactInfo || supplierExists.contactInfo;
        supplierExists.address = address || supplierExists.address;
        await supplierExists.save();
        return res.status(200).json({
            success: true,
            message: `Supplier "${supplierExists.name}" updated successfully.`,
            supplier: supplierExists,
        });
    } catch (error) {
        console.error("Error updating supplier:", error);
        res.status(500).json({
            success: false,
            message: "Error in editSupplier controller",
            error: error.message,
        });
    }
};


export const deleteSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const supplierExists = await Supplier.findById(supplierId);
        if (!supplierExists) {
            return res.status(404).json({ success: false, message: "Supplier not found!" });
        }
        await Supplier.findByIdAndDelete(supplierId);
        return res.status(200).json({
            success: true,
            message: `Supplier "${supplierExists.name}" deleted successfully.`,
        });
    } catch (error) {
        console.error("Error deleting supplier:", error);
        res.status(500).json({
            success: false,
            message: "Error in deleteSupplier controller",
            error: error.message,
        });
    }
};