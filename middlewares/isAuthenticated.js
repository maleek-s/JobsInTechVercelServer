import admin from "firebase-admin";

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        let decoded;
        try {
            // ✅ First, try to verify with JWT
            decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.id = decoded.userId; // MongoDB _id
        } catch (error) {
            try {
                // ✅ If JWT fails, try Firebase token verification
                const firebaseUser = await admin.auth().verifyIdToken(token);
                const user = await User.findOne({ firebaseUID: firebaseUser.uid });

                if (!user) {
                    return res.status(401).json({ message: "User not found", success: false });
                }

                req.id = user._id; // ✅ Use MongoDB _id for consistency
            } catch (firebaseError) {
                console.error("Token verification failed:", firebaseError);
                return res.status(401).json({ message: "Authentication failed", success: false });
            }
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Authentication failed", success: false });
    }
};


export default isAuthenticated;
