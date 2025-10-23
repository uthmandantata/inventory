import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.js";
import authRoutes from './routes/Auth.routes.js'
import categoryRoutes from './routes/Category.routes.js'
import supplierRoutes from './routes/Supplier.routes.js'
import productRoutes from './routes/Product.routes.js';
import userRoutes from './routes/User.routes.js';
import cors from "cors"
import path from "path";

import cookieParser from "cookie-parser";



dotenv.config()

const app = express();
const PORT = process.env.PORT;



// Allow your frontend origin
const allowedOrigins = [
    "https://inventory-chi-flame.vercel.app", // your Vercel frontend
    "http://localhost:5173", // for local testing
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);


app.use(cookieParser()); // must be before routes

// Middleware
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/supplier', supplierRoutes)
app.use('/api/product', productRoutes)
app.use('/api/users', userRoutes)


app.listen(PORT, () => {
    dbConnect();
    console.log(`Server running on port: ${PORT}`)
})