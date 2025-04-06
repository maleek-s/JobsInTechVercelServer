import express from "express";
import checkOrigin from "../middlewares/checkOrigin.js";
import verifySecretKey from "../middlewares/verifySecretKey.js";
import {getAllJobs, getJobById, postJob, deactivateJobs, getJobByCategory, searchJob } from "../controllers/job.controller.js";

const router = express.Router();

router.route("/post").post(verifySecretKey, postJob);
router.route("/deactivate").post(verifySecretKey, deactivateJobs);
router.route("/get").get(verifySecretKey, checkOrigin,getAllJobs);
router.route("/get/:id").get(verifySecretKey, checkOrigin,getJobById);
router.route("/categories/:category?").get(getJobByCategory);
router.route("/search").get(verifySecretKey, checkOrigin,searchJob);

export default router;

