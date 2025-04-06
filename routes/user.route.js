import express from "express";
import { login, logout, googleLogin, register, updateProfile, getMe } from "../controllers/user.controller.js";
import checkOrigin from "../middlewares/checkOrigin.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js"; 
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.post("/google-login", googleLogin);
router.route("/logout").get(checkOrigin, logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);
router.get("/me", isAuthenticated, getMe);


export default router;

