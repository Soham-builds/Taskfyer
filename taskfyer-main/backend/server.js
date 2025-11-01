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
// ✅ CORS CONFIG
// ======================
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // allow server-to-server or curl
        origin === "http://localhost:3000" ||
        /^https:\/\/taskfyer.*\.vercel\.app$/.test(origin)
      ) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        callback(new Error("CORS not allowed for origin: " + origin));
      }
    },
    credentials: true,
  })
);

// ======================
// ✅ BODY PARSERS & COOKIES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// ✅ AUTO-LOAD ROUTES
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
// ✅ ERROR HANDLER
// ======================
app.use(errorHandler);

// ======================
// ✅ SERVER START
// ======================
const startServer = async () => {
  try {
    await connect();
    app.listen(port, () =>
      console.log(`🚀 Server running on port ${port}`)
    );
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
