import express from "express";
import {getAllJobs, getJobById, postJob, deactivateJobs, getJobByCategory, searchJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(postJob);
router.route("/deactivate").post(deactivateJobs);
router.route("/get").get(getAllJobs);
router.route("/get/:id").get(getJobById);
router.route("/categories/:category?").get(getJobByCategory);
router.route("/search").get(searchJob);

export default router;

