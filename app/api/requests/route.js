import { ApiError, handle, readBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { REQUEST_STATUS } from "@/lib/constants";
import { checkId, dateValue, number, text } from "@/lib/validate";
import FoodListing from "@/models/FoodListing";
import PickupRequest from "@/models/PickupRequest";
import PickupHistory from "@/models/PickupHistory";
import { notify } from "@/services/notify";
import { availableActions } from "@/services/requests";

// Each role sees a different slice of the pickup requests.
export const GET = handle(async (request) => {
  const user = await requireUser(["DONOR", "NGO", "VOLUNTEER", "ADMIN"]);
  const status = new URL(request.url).searchParams.get("status");

  let filter = {};
  if (user.role === "DONOR") filter = { donor: user._id };
  if (user.role === "NGO") filter = { requester: user._id };
  if (user.role === "VOLUNTEER") {
    // their own pickups + approved pickups nobody has claimed yet
    filter = { $or: [{ volunteer: user._id }, { status: "APPROVED", volunteer: null }] };
  }
  if (status && REQUEST_STATUS.includes(status)) filter = { $and: [filter, { status }] };

  const docs = await PickupRequest.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  const requests = docs.map((doc) => ({ ...doc, actions: availableActions(user, doc) }));

  await PickupRequest.populate(requests, [
    { path: "listing", select: "name unit location" },
    { path: "requester", select: "name organizationName phone" },
    { path: "donor", select: "name organizationName phone" },
    { path: "volunteer", select: "name phone" },
  ]);
  return Response.json({ requests });
});

// Verified NGOs only: request a pickup.
export const POST = handle(async (request) => {
  const user = await requireUser(["NGO"]);
  if (!user.isVerified) {
    throw new ApiError(403, "Your organization must be verified by an admin before requesting pickups.");
  }

  const body = await readBody(request);
  checkId(body.listingId);
  const quantity = number(body.quantity, "Quantity", { min: 1, integer: true });
  const preferredTime = dateValue(body.preferredTime, "Preferred pickup time");
  const message = text(body.message, "Message", { optional: true, max: 500 });

  const listing = await FoodListing.findById(body.listingId);
  if (!listing) throw new ApiError(404, "Food listing not found.");
  if (listing.status !== "AVAILABLE") throw new ApiError(409, "This food is no longer available.");
  if (listing.expiresAt <= new Date()) throw new ApiError(409, "This food has expired.");
  if (quantity > listing.availableQuantity) {
    throw new ApiError(400, `Only ${listing.availableQuantity} ${listing.unit} left.`);
  }
  if (preferredTime <= new Date()) throw new ApiError(400, "Preferred pickup time must be in the future.");
  if (preferredTime >= listing.expiresAt) {
    throw new ApiError(400, "Preferred pickup time must be before the food expires.");
  }

  const duplicate = await PickupRequest.exists({
    listing: listing._id,
    requester: user._id,
    status: { $in: ["PENDING", "APPROVED", "ASSIGNED", "IN_TRANSIT"] },
  });
  if (duplicate) throw new ApiError(409, "You already have an open request for this listing.");

  const created = await PickupRequest.create({
    listing: listing._id,
    donor: listing.donor,
    requester: user._id,
    quantity,
    unit: listing.unit,
    preferredTime,
    message,
  });
  await PickupHistory.create({
    request: created._id,
    listing: listing._id,
    actor: user._id,
    action: "create",
    toStatus: "PENDING",
  });
  await notify(
    listing.donor,
    "NEW_REQUEST",
    `${user.organizationName || user.name} requested ${quantity} ${listing.unit} of "${listing.name}".`
  );

  return Response.json({ request: created }, { status: 201 });
});
