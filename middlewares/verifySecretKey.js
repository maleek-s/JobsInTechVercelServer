import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const verifySecretKey = (req, res, next) => {
  const clientDigest = req.headers['x-digest'];
  const timestamp = req.headers['x-timestamp'];

  if (!clientDigest || !timestamp) {
    return res.status(400).json({ message: 'Missing digest or timestamp' });
  }

  const secretKey = process.env.API_SECRET_KEY;
  const dataToHash = `${secretKey}:${timestamp}`;
  const expectedDigest = crypto.createHash('sha512').update(dataToHash).digest('hex');

  if (expectedDigest !== clientDigest) {
    console.warn('🚫 Digest mismatch');
    return res.status(403).json({ message: 'Forbidden: Invalid digest' });
  }

  // Optionally check timestamp freshness (e.g., not older than 5 minutes)
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  const MAX_AGE = 5 * 60 * 1000; // 5 minutes

  if (Math.abs(now - requestTime) > MAX_AGE) {
    return res.status(408).json({ message: 'Request timed out (timestamp too old)' });
  }

  next();
};

export default verifySecretKey;