import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import jobRoute from "./routes/job.route.js";
import careersRoute from "./routes/careers.route.js";
import savedJobRoute from "./routes/savedJob.route.js";
import sitemapRouter from "./routes/sitemap.route.js";
import dotenv from 'dotenv'
import { runCareerScraper } from "./scrapers/careerScraper.js";
import { runJobScraperTextContent } from "./scrapers/jobScraper.js"; // Import the job scraper
import readline from "readline";

dotenv.config()

const app = express();
const PORT = 8000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Configure CORS
const corsOptions = {
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));

// Connect to MongoDB using Mongoose
connectDB();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/careers", careersRoute);
app.use("/api/v1/save", savedJobRoute);
app.use('/', sitemapRouter);

// Start the server and connect to the database
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);

  // Set a timeout to delay the prompts by 10 seconds
  setTimeout(() => {
      // Create an interface for reading lines from the terminal
      const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
      });

      // Ask if the user wants to run the career scraper
      rl.question("Do you want to run the career scraper? (y/n) ", function(answer) {
          if (answer.toLowerCase() === 'y') {
              runCareerScraper();
          }

          // Ask if the user wants to run the job scraper immediately
          rl.question("Do you want to run the job scraper immediately and every 12 hours? (y/n) ", function(answer) {
              if (answer.toLowerCase() === 'y') {
                  runJobScraperTextContent();
                  setInterval(runJobScraperTextContent, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
              }

              // Close the readline interface after all questions are answered
              rl.close();
          });
      });
  }, 10000); // 10000 milliseconds = 10 seconds
});
