import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    sku: { type: String },
    description: { type: String },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, required: true, default: 10 },

    expiryDate: { type: Date },
    location: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String },
    status: {
        type: String,
        enum: ["active", "out_of_stock"],
        default: "active",
    },
}, { timestamps: true });

productSchema.virtual('isLowStock').get(function () {
    return this.quantity <= this.reorderLevel;
});

productSchema.pre('save', function (next) {
    if (!this.sku) {
        this.sku = 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;