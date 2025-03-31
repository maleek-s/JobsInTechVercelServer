import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        console.log("🔍 Checking authentication...");
        console.log(req.cookies)

        let token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.split(" ")[1]);
        console.log("📝 Extracted Token:", token);

        if (!token) {
            console.warn("❌ No token provided.");
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        let decoded;
        try {
            console.log("🔑 Attempting JWT verification...");
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            console.log("✅ JWT Verified:", decoded);

            req.id = decoded.userId; // MongoDB _id
            console.log("🆔 User ID from JWT:", req.id);
        } catch (error) {
            console.warn("⚠️ JWT verification failed, trying Firebase...", error.message);

            try {
                console.log("🔐 Verifying Firebase token...");
                const firebaseUser = await admin.auth().verifyIdToken(token);
                console.log("✅ Firebase Token Verified:", firebaseUser);

                const user = await User.findOne({ firebaseUID: firebaseUser.uid });
                console.log("🔍 Searching user in DB with firebaseUID:", firebaseUser.uid);

                if (!user) {
                    console.warn("❌ No user found with this Firebase UID.");
                    return res.status(401).json({ message: "User not found", success: false });
                }

                req.id = user._id; // MongoDB _id
                console.log("🆔 User ID from Firebase:", req.id);
            } catch (firebaseError) {
                console.error("❌ Firebase token verification failed:", firebaseError);
                return res.status(401).json({ message: "Authentication failed", success: false });
            }
        }

        console.log("✅ Authentication successful! Proceeding to next middleware...");
        next();
    } catch (error) {
        console.error("❌ Unexpected error during authentication:", error);
        return res.status(401).json({ message: "Authentication failed", success: false });
    }
};

export default isAuthenticated;
