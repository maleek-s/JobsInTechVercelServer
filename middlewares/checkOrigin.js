import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const allowedDomains = [
  'https://jobsintech.live',
  'http://localhost:5173',
];

const secretKey = process.env.API_SECRET_KEY;

const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  const digest = req.headers['x-digest'];
  const timestamp = req.headers['x-timestamp'];

  const isValidOrigin = origin && allowedDomains.some(domain => origin.startsWith(domain));

  if (!digest || !timestamp) {
    return res.status(400).json({ message: 'Missing digest or timestamp' });
  }

  const dataToHash = `${secretKey}:${timestamp}`;
  const expectedDigest = crypto.createHash('sha512').update(dataToHash).digest('hex');

  const digestMatches = expectedDigest === digest;

  // Optionally check timestamp freshness (5-minute window)
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  const MAX_AGE = 5 * 60 * 1000;

  if (Math.abs(now - requestTime) > MAX_AGE) {
    return res.status(408).json({ message: 'Request timed out (timestamp too old)' });
  }

  if (isValidOrigin && digestMatches) {
    return next();
  }

  console.warn('🚫 Request blocked:', {
    origin,
    digest,
    reason: !isValidOrigin ? 'Invalid/Missing Origin' : 'Invalid/Missing or incorrect Digest'
  });

  return res.status(403).json({ message: 'Forbidden: Origin or Digest invalid' });
};

export default checkOrigin;
