import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import waitlistRoutes from "./routes/waitlist.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";
import { requestLogger } from "./middleware/logger.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { resolveUserPlan } from "./middleware/planGuard.js";

dotenv.config({ path: new URL("./.env", import.meta.url) });

const requiredEnv = ["MONGO_DB_URI", "CLERK_SECRET_KEY", "OPENAI_API_KEY"];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((origin) => origin.trim()).filter(Boolean);
const trustProxyEnv = process.env.TRUST_PROXY;

if (trustProxyEnv !== undefined) {
  app.set("trust proxy", trustProxyEnv === "true" ? 1 : trustProxyEnv);
} else if (process.env.NODE_ENV === "production") {
  // Common production default behind a single reverse proxy/LB.
  app.set("trust proxy", 1);
}

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(requestLogger);
app.use(rateLimit);

// CORS: in production, you MUST configure CORS_ORIGIN to one or more explicit origins.
app.use((req, res, next) => {
  const requestOrigin = req.header("origin");
  if (!allowedOrigins.length) {
    if (process.env.NODE_ENV === "production") {
      // eslint-disable-next-line no-console
      console.error("CORS_ORIGIN must be set in production to at least one allowed origin.");
      return res.status(500).json({ message: "Server misconfiguration: CORS origin not set" });
    }
    res.header("Access-Control-Allow-Origin", "*");
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-clerk-user-id, x-user-id, x-requested-with",
  );
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  return next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the asylumapp API");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/waitlist", waitlistRoutes);
app.use("/api/chat", requireAuth, resolveUserPlan, chatRoutes);
app.use("/api/user", requireAuth, resolveUserPlan, userRoutes);
app.use("/api/admin", requireAdmin, adminRoutes);

// Basic error handler.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const start = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`API listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to database connection error.");
    process.exit(1);
  }
};

start();
