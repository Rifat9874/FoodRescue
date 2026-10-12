import mongoose from "mongoose";
import { ALL_ROLES } from "@/lib/constants";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // hidden from queries by default
    role: { type: String, enum: ALL_ROLES, required: true },
    organizationName: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, trim: true, maxlength: 30, default: "" },
    address: { type: String, trim: true, maxlength: 200, default: "" },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "users" }
);

userSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
