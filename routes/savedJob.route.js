import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkOrigin from "../middlewares/checkOrigin.js";
import { saveJob, getSavedJobs } from "../controllers/savedJob.controller.js";
 
const router = express.Router();

router.route("/post/:id").post( isAuthenticated, checkOrigin, saveJob);
router.route("/get").get(isAuthenticated, checkOrigin, getSavedJobs); 

export default router;

