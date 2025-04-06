import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import jobRoute from "./routes/job.route.js";
import careersRoute from "./routes/careers.route.js";
import savedJobRoute from "./routes/savedJob.route.js";
import sitemapRouter from "./routes/sitemap.route.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // Don't forget to import CORS as well!

dotenv.config();

const app = express();

// Use `fileURLToPath` and `path.dirname` to get `__dirname`
const __file = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__file); 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    'https://jobsintech.live',
    'https://server.jobsintech.live',
    'http://localhost:5173',
    'http://127.0.0.1:5000'
];

const corsOptions = {
    origin: (origin, callback) => {
        console.log("Origin:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // ✅ Ensure credentials are allowed
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Add necessary headers
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/careers", careersRoute);
app.use("/api/v1/save", savedJobRoute);
app.use("/", sitemapRouter);

// Instead of `createServer()`, simply export the app
export default app;