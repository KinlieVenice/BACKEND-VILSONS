// middleware/cors.js
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if the request origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  
  // Allow common HTTP methods
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  
  // Allow standard headers + Authorization for JWTs
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");
  
  // Allow credentials (only works with specific origins, not wildcard)
  res.header("Access-Control-Allow-Credentials", "true");

  // Expose headers if needed
  res.header("Access-Control-Expose-Headers", "Authorization");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

module.exports = corsMiddleware;