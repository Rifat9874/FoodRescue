import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

// One row per status change: an audit trail for every pickup request.
const pickupHistorySchema = new mongoose.Schema(
  {
    request: { type: ObjectId, ref: "PickupRequest", required: true },
    listing: { type: ObjectId, ref: "FoodListing", required: true },
    actor: { type: ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    fromStatus: { type: String, default: "" },
    toStatus: { type: String, required: true },
    note: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "pickupHistory" }
);

pickupHistorySchema.index({ request: 1, createdAt: 1 });

export default mongoose.models.PickupHistory || mongoose.model("PickupHistory", pickupHistorySchema);
