import express from "express";
import checkOrigin from "../middlewares/checkOrigin.js";
import verifySecretKey from "../middlewares/verifySecretKey.js";
import {getAllJobs, getJobById, postJob, deactivateJobs, getJobByCategory, searchJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(postJob);
router.route("/deactivate").post(checkOrigin, deactivateJobs);
router.route("/get").get(checkOrigin,getAllJobs);
router.route("/get/:id").get(checkOrigin,getJobById);
router.route("/categories/:category?").get(checkOrigin, getJobByCategory);
router.route("/search").get(checkOrigin,searchJob);

export default router;

