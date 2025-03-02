import express from "express";
import {getAllCareers, postCareers } from "../controllers/careers.controller.js";

const router = express.Router();

router.route("/get").get(getAllCareers);
router.route("/post").post(postCareers);

export default router;

