import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "@/lib/constants";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    message: { type: String, required: true, maxlength: 300 },
    link: { type: String, default: "/requests" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "notifications" }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
