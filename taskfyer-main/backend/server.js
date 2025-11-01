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

// ✅ 1. CORS FIRST
app.use(
  cors({
    origin: process.env.CLIENT_URL, // example: "https://taskfyer-frontend.onrender.com"
    credentials: true, // allow cookies
  })
);

// ✅ 2. BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 3. COOKIE PARSER
app.use(cookieParser());

// ✅ 4. ROUTES
const routeFiles = fs.readdirSync("./src/routes");
routeFiles.forEach((file) => {
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.log("Failed to load route file:", err);
    });
});

// ✅ 5. ERROR HANDLER (always last)
app.use(errorHandler);

const startServer = async () => {
  try {
    await connect();
    app.listen(port, () => console.log(`✅ Server running on port ${port}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
