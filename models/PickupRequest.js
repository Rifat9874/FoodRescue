import mongoose from "mongoose";
import { REQUEST_STATUS, UNITS } from "@/lib/constants";

const { ObjectId } = mongoose.Schema.Types;

const pickupRequestSchema = new mongoose.Schema(
  {
    listing: { type: ObjectId, ref: "FoodListing", required: true },
    donor: { type: ObjectId, ref: "User", required: true },
    requester: { type: ObjectId, ref: "User", required: true }, // the NGO
    volunteer: { type: ObjectId, ref: "User", default: null },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, enum: UNITS, required: true }, // copied from the listing for statistics
    preferredTime: { type: Date, required: true },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: REQUEST_STATUS, default: "PENDING" },
  },
  { timestamps: true, collection: "pickupRequests" }
);

pickupRequestSchema.index({ listing: 1, status: 1 });
pickupRequestSchema.index({ requester: 1, createdAt: -1 });
pickupRequestSchema.index({ donor: 1, createdAt: -1 });
pickupRequestSchema.index({ volunteer: 1, status: 1 });
pickupRequestSchema.index({ status: 1 });

export default mongoose.models.PickupRequest || mongoose.model("PickupRequest", pickupRequestSchema);
