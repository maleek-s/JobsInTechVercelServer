// middlewares/checkOrigin.js
const allowedDomains = ['https://jobsintech.live'];

const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  console.log('🔍 Origin/Referer detected:', origin);

  if (!origin || allowedDomains.some(domain => origin.startsWith(domain))) {
    next(); // ✅ Allowed
  } else {
    console.warn('🚫 Request blocked due to invalid origin:', origin);
    return res.status(403).json({ message: 'Forbidden: Invalid origin' });
  }
};

export default checkOrigin;
