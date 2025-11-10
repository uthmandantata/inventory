import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.js";
import authRoutes from './routes/Auth.routes.js'
import categoryRoutes from './routes/Category.routes.js'
import supplierRoutes from './routes/Supplier.routes.js'
import productRoutes from './routes/Product.routes.js';
import userRoutes from './routes/User.routes.js';
import cors from "cors"



import cookieParser from "cookie-parser";



dotenv.config()

const app = express();
const PORT = process.env.PORT;



// Allow your frontend origin
const allowedOrigins = [
    "https://inventory-chi-flame.vercel.app",
    "https://ambefoundation.vercel.app",
    "http://localhost:5173", // for local testing
];

// ✅ STEP 2: Apply CORS middleware FIRST — before any other middleware
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// app.options("*", cors());



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