const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Always set credentials header
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Set origin if it's in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

module.exports = corsMiddleware;
