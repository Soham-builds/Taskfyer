import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// ======================
// ✅ 1. CORS SETUP
// ======================
const allowedOrigins = [
  process.env.CLIENT_URL, // from .env (example: https://taskfyer-frontend.onrender.com)
  "http://localhost:3000", // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);

// ======================
// ✅ 2. PARSERS
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// ✅ 3. COOKIE PARSER
// ======================
app.use(cookieParser());

// ======================
// ✅ 4. ROUTES AUTO-LOADING
// ======================
const routeFiles = fs.readdirSync("./src/routes");
for (const file of routeFiles) {
  try {
    const route = await import(`./src/routes/${file}`);
    app.use("/api/v1", route.default);
    console.log(`📦 Route loaded: ${file}`);
  } catch (err) {
    console.error(`❌ Failed to load route file (${file}):`, err.message);
  }
}

// ======================
// ✅ 5. ERROR HANDLER (always last)
// ======================
app.use(errorHandler);

// ======================
// ✅ 6. START SERVER
// ======================
const startServer = async () => {
  try {
    await connect();
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
