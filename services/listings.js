import { ApiError } from "@/lib/api";
import { CATEGORIES, UNITS, CONDITIONS } from "@/lib/constants";
import { checkId, dateValue, number, oneOf, imageValue, text } from "@/lib/validate";
import FoodListing from "@/models/FoodListing";
import PickupRequest from "@/models/PickupRequest";

// Validates the body of POST/PUT /api/food and returns clean values.
export function parseListing(body) {
  const availableFrom = dateValue(body.availableFrom, "Available from");
  const expiresAt = dateValue(body.expiresAt, "Available until");
  if (expiresAt <= new Date()) throw new ApiError(400, "Available-until time must be in the future.");
  if (expiresAt <= availableFrom) throw new ApiError(400, "Available-until must be after available-from.");

  return {
    name: text(body.name, "Food name", { min: 2, max: 100 }),
    category: oneOf(body.category, CATEGORIES, "Category"),
    quantity: number(body.quantity, "Quantity", { min: 1, max: 100000, integer: true }),
    unit: oneOf(body.unit, UNITS, "Unit"),
    description: text(body.description, "Description", { optional: true, max: 500 }),
    location: text(body.location, "Pickup location", { min: 5, max: 200 }),
    availableFrom,
    expiresAt,
    condition: oneOf(body.condition, CONDITIONS, "Food condition"),
    imageUrl: imageValue(body.imageUrl, "Image"),
  };
}

// Loads a listing and checks the user may manage it (owner donor or admin).
export async function loadManagedListing(id, user) {
  checkId(id);
  const listing = await FoodListing.findById(id);
  if (!listing) throw new ApiError(404, "Food listing not found.");
  if (user.role !== "ADMIN" && String(listing.donor) !== String(user._id)) {
    throw new ApiError(403, "You can only manage your own listings.");
  }
  return listing;
}

// Recalculates the listing status from its remaining quantity and its requests.
export async function syncListingStatus(listingId) {
  const listing = await FoodListing.findById(listingId);
  if (!listing || listing.status === "CANCELLED") return listing;

  if (listing.availableQuantity > 0) {
    listing.status = listing.expiresAt <= new Date() ? "EXPIRED" : "AVAILABLE";
  } else {
    const statuses = await PickupRequest.distinct("status", { listing: listing._id });
    if (statuses.some((s) => ["APPROVED", "ASSIGNED", "IN_TRANSIT"].includes(s))) {
      listing.status = "RESERVED";
    } else if (statuses.includes("PICKED_UP")) {
      listing.status = "PICKED_UP";
    } else {
      listing.status = "COMPLETED";
    }
  }
  await listing.save();
  return listing;
}
