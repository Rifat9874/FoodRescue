import { handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import User from "@/models/User";
import FoodListing from "@/models/FoodListing";
import PickupRequest from "@/models/PickupRequest";
import { getPlatformStats, quantityCompleted } from "@/services/stats";

// Returns { cards: [{ label, value }] } tailored to the logged-in role.
export const GET = handle(async () => {
  const user = await requireUser(["DONOR", "NGO", "VOLUNTEER", "ADMIN"]);
  const now = new Date();
  let cards = [];

  if (user.role === "DONOR") {
    const mine = { donor: user._id };
    const [listings, available, received, pending, completed, qty] = await Promise.all([
      FoodListing.countDocuments(mine),
      FoodListing.countDocuments({ ...mine, status: "AVAILABLE", expiresAt: { $gt: now } }),
      PickupRequest.countDocuments(mine),
      PickupRequest.countDocuments({ ...mine, status: "PENDING" }),
      PickupRequest.countDocuments({ ...mine, status: "COMPLETED" }),
      quantityCompleted(mine),
    ]);
    cards = [
      { label: "My listings", value: listings },
      { label: "Available now", value: available },
      { label: "Requests received", value: received },
      { label: "Pending requests", value: pending },
      { label: "Completed pickups", value: completed },
      { label: "Meals donated", value: qty.meals },
      { label: "Kg donated", value: qty.kg },
    ];
  }

  if (user.role === "NGO") {
    const mine = { requester: user._id };
    const [total, pending, active, completed, qty] = await Promise.all([
      PickupRequest.countDocuments(mine),
      PickupRequest.countDocuments({ ...mine, status: "PENDING" }),
      PickupRequest.countDocuments({ ...mine, status: { $in: ["APPROVED", "ASSIGNED", "IN_TRANSIT", "PICKED_UP"] } }),
      PickupRequest.countDocuments({ ...mine, status: "COMPLETED" }),
      quantityCompleted(mine),
    ]);
    cards = [
      { label: "My requests", value: total },
      { label: "Pending", value: pending },
      { label: "In progress", value: active },
      { label: "Completed pickups", value: completed },
      { label: "Meals received", value: qty.meals },
      { label: "Kg received", value: qty.kg },
    ];
  }

  if (user.role === "VOLUNTEER") {
    const mine = { volunteer: user._id };
    const [open, assigned, completed] = await Promise.all([
      PickupRequest.countDocuments({ status: "APPROVED", volunteer: null }),
      PickupRequest.countDocuments({ ...mine, status: { $in: ["ASSIGNED", "IN_TRANSIT", "PICKED_UP"] } }),
      PickupRequest.countDocuments({ ...mine, status: "COMPLETED" }),
    ]);
    cards = [
      { label: "Open pickup tasks", value: open },
      { label: "My active pickups", value: assigned },
      { label: "My completed pickups", value: completed },
    ];
  }

  if (user.role === "ADMIN") {
    const [platform, unverified, suspended] = await Promise.all([
      getPlatformStats(),
      User.countDocuments({ role: { $in: ["DONOR", "NGO"] }, isVerified: false, isSuspended: false }),
      User.countDocuments({ isSuspended: true }),
    ]);
    cards = [
      { label: "Total listings", value: platform.totalListings },
      { label: "Available listings", value: platform.availableListings },
      { label: "Total requests", value: platform.totalRequests },
      { label: "Pending requests", value: platform.pendingRequests },
      { label: "Completed pickups", value: platform.completedPickups },
      { label: "Meals rescued", value: platform.mealsRescued },
      { label: "Kg rescued", value: platform.kgRescued },
      { label: "Donors", value: platform.donors },
      { label: "NGOs", value: platform.ngos },
      { label: "Volunteers", value: platform.volunteers },
      { label: "Awaiting verification", value: unverified },
      { label: "Suspended users", value: suspended },
    ];
  }

  return Response.json({ cards });
});
