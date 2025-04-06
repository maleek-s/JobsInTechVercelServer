// middlewares/verifySecretKey.js
import dotenv from 'dotenv';
dotenv.config();

const verifySecretKey = (req, res, next) => {
  const clientKey = req.headers['x-api-key']; // Custom header
  const serverKey = process.env.API_SECRET_KEY;

  if (clientKey && clientKey === serverKey) {
    return next(); // ✅ Authenticated
  }

  console.warn('🚫 Missing or invalid API key:', clientKey);
  return res.status(403).json({ message: 'Forbidden: Invalid API key' });
};

export default verifySecretKey;
