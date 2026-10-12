import mongoose from "mongoose";
import { ApiError } from "./api";

const bad = (message) => {
  throw new ApiError(400, message);
};

// Only accepts real strings, so objects like {"$ne": ""} can never reach MongoDB.
export function text(value, label, { min = 1, max = 200, optional = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (optional) return "";
    bad(`${label} is required.`);
  }
  if (typeof value !== "string") bad(`${label} must be text.`);
  const v = value.trim();
  if (v.length < min) bad(`${label} is too short (minimum ${min} characters).`);
  if (v.length > max) bad(`${label} is too long (maximum ${max} characters).`);
  return v;
}

export function number(value, label, { min = 1, max = 100000, integer = false } = {}) {
  const n = Number(value);
  if (value === "" || value === null || value === undefined || !Number.isFinite(n)) {
    bad(`${label} must be a number.`);
  }
  if (integer && !Number.isInteger(n)) bad(`${label} must be a whole number.`);
  if (n < min || n > max) bad(`${label} must be between ${min} and ${max}.`);
  return n;
}

export function oneOf(value, list, label) {
  if (!list.includes(value)) bad(`${label} is invalid.`);
  return value;
}

export function dateValue(value, label) {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) bad(`${label} must be a valid date and time.`);
  return d;
}

export function emailAddress(value) {
  const v = text(value, "Email", { max: 120 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad("Enter a valid email address.");
  return v;
}

export function password(value) {
  if (
    typeof value !== "string" ||
    value.length < 8 ||
    value.length > 72 ||
    !/[A-Za-z]/.test(value) ||
    !/\d/.test(value)
  ) {
    bad("Password must be 8–72 characters and include a letter and a number.");
  }
  return value;
}

export function urlOrEmpty(value, label) {
  if (!value) return "";
  const v = text(value, label, { max: 500 });
  try {
    const url = new URL(v);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocol");
  } catch {
    bad(`${label} must be a valid http(s) link.`);
  }
  return v;
}

export function checkId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "Not found.");
  return id;
}

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const GALLERY_FILE = /^\/images\/food\/[a-z0-9-]+\.(svg|jpe?g|png|webp)$/; // files shipped in /public

// A listing image is either one of the built-in gallery images or an http(s) link.
export function imageValue(value, label = "Image") {
  if (!value) return "";
  if (typeof value === "string" && GALLERY_FILE.test(value)) return value;
  return urlOrEmpty(value, label);
}
