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
// ✅ 1. CORS SETUP (Critical Fix)
// ======================
const allowedOrigins = [
  "https://taskfyer-xi-three.vercel.app", // your live frontend (Vercel)
  "http://localhost:3000", // local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow no-origin requests (Postman, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        callback(new Error("CORS not allowed for origin: " + origin));
      }
    },
    credentials: true, // allow cookies, tokens
  })
);

// ======================
// ✅ 2. MIDDLEWARES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// ✅ 3. ROUTES AUTO-LOADING
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
// ✅ 4. ERROR HANDLER (MUST BE LAST)
// ======================
app.use(errorHandler);

// ======================
// ✅ 5. DATABASE + SERVER START
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
