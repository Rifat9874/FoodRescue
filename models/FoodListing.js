import mongoose from "mongoose";
import { CATEGORIES, UNITS, CONDITIONS, FOOD_STATUS } from "@/lib/constants";

const foodListingSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, enum: CATEGORIES, required: true },
    quantity: { type: Number, required: true, min: 1 }, // total posted
    availableQuantity: { type: Number, required: true, min: 0 }, // not yet reserved
    unit: { type: String, enum: UNITS, required: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    availableFrom: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    condition: { type: String, enum: CONDITIONS, required: true },
    imageUrl: { type: String, default: "" },
    status: { type: String, enum: FOOD_STATUS, default: "AVAILABLE" },
    expiryNotified: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "foodListings" }
);

foodListingSchema.index({ status: 1, expiresAt: 1 });
foodListingSchema.index({ donor: 1, createdAt: -1 });
foodListingSchema.index({ createdAt: -1 });

export default mongoose.models.FoodListing || mongoose.model("FoodListing", foodListingSchema);
