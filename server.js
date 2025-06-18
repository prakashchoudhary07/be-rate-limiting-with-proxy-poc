const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 30 * 1000,
  max: 3, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "30 seconds",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.set("trust proxy", 1);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Express server is running!" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/ip", (req, res) => {
  const ip = req.ip;
  console.log(
    `IP address requested: ${ip}
    || X-Forwarded-For: ${req.headers["x-forwarded-for"] || ""} 
    || Real IP: ${req.socket.remoteAddress}`
  );
  res.json({
    ip,
    xForwardedFor: req.headers["x-forwarded-for"] || "",
    realIp: req.socket.remoteAddress,
  });
});

app.get("/limit", limiter, (req, res) => {
  res.json({ message: "This is a rate-limited sensitive endpoint" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
