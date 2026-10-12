import User from "@/models/User";
import FoodListing from "@/models/FoodListing";
import PickupRequest from "@/models/PickupRequest";

// Sum of completed request quantities, split by unit. "Meals" = portions.
export async function quantityCompleted(match = {}) {
  const rows = await PickupRequest.aggregate([
    { $match: { status: "COMPLETED", ...match } },
    { $group: { _id: "$unit", total: { $sum: "$quantity" } } },
  ]);
  const byUnit = Object.fromEntries(rows.map((r) => [r._id, r.total]));
  return { meals: byUnit.portions || 0, kg: byUnit.kg || 0 };
}

export async function getPlatformStats() {
  const now = new Date();
  const [totalListings, availableListings, totalRequests, pendingRequests, completedPickups, donors, ngos, volunteers, rescued] =
    await Promise.all([
      FoodListing.countDocuments(),
      FoodListing.countDocuments({ status: "AVAILABLE", expiresAt: { $gt: now }, availableQuantity: { $gt: 0 } }),
      PickupRequest.countDocuments(),
      PickupRequest.countDocuments({ status: "PENDING" }),
      PickupRequest.countDocuments({ status: "COMPLETED" }),
      User.countDocuments({ role: "DONOR" }),
      User.countDocuments({ role: "NGO" }),
      User.countDocuments({ role: "VOLUNTEER" }),
      quantityCompleted(),
    ]);

  return {
    totalListings,
    availableListings,
    totalRequests,
    pendingRequests,
    completedPickups,
    mealsRescued: rescued.meals,
    kgRescued: rescued.kg,
    donors,
    ngos,
    volunteers,
  };
}
