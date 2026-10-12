import mongoose from "mongoose";
import { ApiError } from "./api";

// Cache the connection so hot reloads / serverless calls reuse it.
const cache = global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new ApiError(503, "Database is not configured.");
  if (cache.conn) return cache.conn;

  try {
    cache.promise ||= mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    console.error("MongoDB connection failed:", error.message);
    throw new ApiError(503, "Cannot reach the database. Please try again later.");
  }
  return cache.conn;
}
