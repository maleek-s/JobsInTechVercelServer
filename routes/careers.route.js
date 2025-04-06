import express from "express";
import checkOrigin from "../middlewares/checkOrigin.js";
import verifySecretKey from "../middlewares/verifySecretKey.js";
import {getAllCareers, postCareers, getRemoteCompaniesWithActiveJobs } from "../controllers/careers.controller.js";


const router = express.Router();

router.route("/get").get(verifySecretKey, checkOrigin, getAllCareers);
router.route("/with-active-jobs").get(verifySecretKey, checkOrigin, getRemoteCompaniesWithActiveJobs);
router.route("/post").post(verifySecretKey, postCareers);

export default router;

