import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",   // links to User model
        required: true
    },
}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;