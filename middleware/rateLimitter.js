const rateLimit = require('express-rate-limit');

// 🌐 Global limiter — applies to all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

// 🔐 Auth-specific limiter — stricter for login/signup
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // only 5 attempts per IP per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again after an hour.' },
});

module.exports = { limiter, authLimiter };
