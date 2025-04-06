import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import verifySecretKey from "../middlewares/verifySecretKey.js";
import { saveJob, getSavedJobs } from "../controllers/savedJob.controller.js";
 
const router = express.Router();

router.route("/post/:id").post(verifySecretKey, isAuthenticated, saveJob);
router.route("/get").get(verifySecretKey, isAuthenticated, getSavedJobs); 

export default router;

