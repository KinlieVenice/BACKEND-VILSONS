// middleware/cors.js
const corsMiddleware = (req, res, next) => {
  // Allow all origins (open CORS)
  res.header("Access-Control-Allow-Origin", "*");
  
  // Allow common HTTP methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  
  // Allow standard headers + Authorization for JWTs
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // Optional: allow credentials (won’t work with '*' in browsers, but safe for dev)
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

module.exports = corsMiddleware;
