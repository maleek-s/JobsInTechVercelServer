import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { saveJob, getSavedJobs } from "../controllers/savedJob.controller.js";
 
const router = express.Router();

router.route("/post/:id").post(isAuthenticated, saveJob);
router.route("/get").get(isAuthenticated, getSavedJobs); 

export default router;

