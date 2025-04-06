// middlewares/checkOrigin.js
const allowedDomains = [
    'https://jobsintech.live',
    'http://localhost:5173'
  ];
  

const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  console.log('🔍 Origin/Referer detected:', origin);

  // Don't allow missing origin (e.g., direct URL access, Postman, etc.)
  if (origin && allowedDomains.some(domain => origin.startsWith(domain))) {
    return next();
  } else {
    console.warn('🚫 Request blocked due to invalid or missing origin:', origin);
    return res.status(403).json({ message: 'Forbidden: Invalid or missing origin' });
  }
};

export default checkOrigin;
