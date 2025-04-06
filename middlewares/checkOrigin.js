// middlewares/checkOrigin.js
const allowedDomains = [
    'https://jobsintech.live',
    'http://localhost:5173',
  ];
  
  // Keep your secret somewhere safe in env
  const expectedSecret = process.env.CLIENT_SECRET_HEADER;

  
  const checkOrigin = (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    const clientSecret = req.headers['x-client-secret']; // 👈 Custom header
  
    console.log('🔍 Origin/Referer detected:', origin);
    console.log('🧪 X-Client-Secret received:', clientSecret);
  
    const isValidOrigin = origin && allowedDomains.some(domain => origin.startsWith(domain));
    const isValidSecret = clientSecret && clientSecret === expectedSecret;

    console.log("🔑 Expected Secret:", expectedSecret);
    console.log("🔑 Received Secret:", clientSecret);
  
    if (isValidOrigin && isValidSecret) {
      return next();
    } else {
      console.warn('🚫 Request blocked:', {
        origin,
        clientSecret,
        reason: !isValidOrigin ? 'Invalid/Missing Origin' : 'Invalid/Missing Secret'
      });
      return res.status(403).json({ message: 'Forbidden: Origin or Secret invalid' });
    }
  };
  
  export default checkOrigin;
  