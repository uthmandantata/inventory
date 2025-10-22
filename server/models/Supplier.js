import mongoose from "mongoose";


const supplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        contactInfo: { type: String, required: true },
        address: { type: String, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;