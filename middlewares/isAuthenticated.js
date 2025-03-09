import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        
        // ✅ Check for Authorization header if no cookie token is found
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        req.id = decode.userId || decode.id;  // ✅ Support both `userId` and `id`

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false,
        });
    }
};


export default isAuthenticated;
