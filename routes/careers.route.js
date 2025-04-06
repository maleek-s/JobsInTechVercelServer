import express from "express";
import checkOrigin from "../middlewares/checkOrigin.js";
import {getAllCareers, postCareers, getRemoteCompaniesWithActiveJobs } from "../controllers/careers.controller.js";


const router = express.Router();

router.route("/get").get(checkOrigin, getAllCareers);
router.route("/with-active-jobs").get(checkOrigin, getRemoteCompaniesWithActiveJobs);
router.route("/post").post(postCareers);

export default router;

