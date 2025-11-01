import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connect from "./src/db/connect.js";
import errorHandler from "./src/helpers/errorhandler.js";

// ✅ Import your routes explicitly
import userRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// ======================
// ✅ 1. CORS CONFIG
// ======================
app.use(
  cors({
    origin: [
      "http://localhost:3000", // local dev
      "https://taskfyer-xi-three.vercel.app/", // your Vercel frontend
    ],
    credentials: true, // allow cookies, tokens, etc.
  })
);

// ======================
// ✅ 2. BODY PARSERS & COOKIES
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// ✅ 3. ROUTES
// ======================
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

// ======================
// ✅ 4. ERROR HANDLER
// ======================
app.use(errorHandler);

// ======================
// ✅ 5. SERVER START
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
