import FoodListing from "@/models/FoodListing";
import { notify } from "./notify";

// Runs lazily whenever listings or notifications are loaded.
// (On a bigger system this would be a scheduled job.)
export async function runMaintenance() {
  const now = new Date();

  // Rule: listings past their "available until" time become EXPIRED.
  await FoodListing.updateMany(
    { status: "AVAILABLE", expiresAt: { $lte: now } },
    { $set: { status: "EXPIRED" } }
  );

  // Notify donors once when a listing will expire within 2 hours.
  const soon = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const expiring = await FoodListing.find({
    status: "AVAILABLE",
    expiresAt: { $gt: now, $lte: soon },
    expiryNotified: false,
  }).select("donor name");

  for (const listing of expiring) {
    await notify(
      listing.donor,
      "LISTING_EXPIRING",
      `"${listing.name}" expires within 2 hours.`,
      `/donate/${listing._id}`
    );
  }
  if (expiring.length) {
    await FoodListing.updateMany(
      { _id: { $in: expiring.map((l) => l._id) } },
      { $set: { expiryNotified: true } }
    );
  }
}
