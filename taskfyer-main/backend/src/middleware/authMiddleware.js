import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

// ---------------------- PROTECT MIDDLEWARE ----------------------
export const protect = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check both Authorization header and cookies
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // If no token found, reject
    if (!token) {
      return res.status(401).json({ message: "Not authorized, please login!" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed!" });
  }
});

// ---------------------- ADMIN MIDDLEWARE ----------------------
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Only admins can do this!" });
  }
});

// ---------------------- CREATOR MIDDLEWARE ----------------------
export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (
    (req.user && req.user.role === "creator") ||
    (req.user && req.user.role === "admin")
  ) {
    next();
  } else {
    return res.status(403).json({ message: "Only creators can do this!" });
  }
});

// ---------------------- VERIFIED MIDDLEWARE ----------------------
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Please verify your email address!" });
  }
});
