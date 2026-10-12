import { handle } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { CATEGORIES } from "@/lib/constants";
import FoodListing from "@/models/FoodListing";
import { runMaintenance } from "@/services/maintenance";

// Public: how many requestable listings each category has right now.
export const GET = handle(async () => {
  await connectDB();
  await runMaintenance();
  const rows = await FoodListing.aggregate([
    { $match: { status: "AVAILABLE", expiresAt: { $gt: new Date() }, availableQuantity: { $gt: 0 } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  return Response.json({
    categories: CATEGORIES.map((name) => ({ name, count: counts[name] || 0 })),
  });
});
