
import cors from "cors";
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

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

// Use `fileURLToPath` and `path.dirname` to get `__dirname`
const __file = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__file); // Fix the typo here

app.use(express.static(path.join(__dirname, "/client/dist")));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    'https://jobsintech.live',  // Your frontend
    'http://localhost:5173'
  ];

const corsOptions = {
    origin: (origin, callback) => {
        console.log("Origin:", origin); // Log the origin
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));

// Connect to MongoDB using Mongoose
connectDB();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/careers", careersRoute);
app.use("/api/v1/save", savedJobRoute);
app.use('/', sitemapRouter);

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/dist/index.html"))
);

// Start the server and connect to the database
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

