import express from "express";
import { login, logout, googleLogin, register, updateProfile, getMe } from "../controllers/user.controller.js";
import checkOrigin from "../middlewares/checkOrigin.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js"; 
 
const router = express.Router();

router.route("/register").post(singleUpload,checkOrigin, register);
router.route("/login").post(checkOrigin, login);
router.post("/google-login", checkOrigin, googleLogin);
router.route("/logout").get(checkOrigin, logout);
router.route("/profile/update").post(isAuthenticated,checkOrigin, singleUpload,updateProfile);
router.get("/me", isAuthenticated, checkOrigin, getMe);


export default router;

