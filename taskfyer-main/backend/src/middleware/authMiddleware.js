import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

// ---------------------- PROTECT MIDDLEWARE ----------------------
export const protect = asyncHandler(async (req, res, next) => {
  let token = null;

  // 1️⃣ Prefer cookie token
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2️⃣ Fallback to Authorization header if manually passed
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 3️⃣ If still no token, reject
  if (!token) {
    return res.status(401).json({ message: "Not authorized, please login!" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (without password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ message: "Not authorized, invalid token!" });
  }
});

// ---------------------- ADMIN MIDDLEWARE ----------------------
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Only admins can do this!" });
  }
});

// ---------------------- CREATOR MIDDLEWARE ----------------------
export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (["creator", "admin"].includes(req.user?.role)) {
    next();
  } else {
    return res.status(403).json({ message: "Only creators can do this!" });
  }
});

// ---------------------- VERIFIED MIDDLEWARE ----------------------
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user?.isVerified) {
    next();
  } else {
    return res.status(403).json({ message: "Please verify your email!" });
  }
});
