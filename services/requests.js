import { ApiError } from "@/lib/api";
import FoodListing from "@/models/FoodListing";
import PickupRequest from "@/models/PickupRequest";
import PickupHistory from "@/models/PickupHistory";
import { notify } from "./notify";
import { syncListingStatus } from "./listings";

export const sameId = (a, b) => Boolean(a && b) && String(a) === String(b);

const isDonor = (u, r) => sameId(r.donor, u._id);
const isRequester = (u, r) => sameId(r.requester, u._id);
const isAssignedVolunteer = (u, r) => sameId(r.volunteer, u._id);
const isCourier = (u, r) => isRequester(u, r) || isAssignedVolunteer(u, r);

// The whole pickup workflow in one table: which statuses an action may start from,
// where it leads, and who may perform it. Admin may perform everything except "claim".
export const TRANSITIONS = {
  approve: { from: ["PENDING"], to: "APPROVED", allowed: isDonor },
  reject: { from: ["PENDING"], to: "REJECTED", allowed: isDonor },
  claim: { from: ["APPROVED"], to: "ASSIGNED", allowed: (u) => u.role === "VOLUNTEER" },
  start: { from: ["APPROVED", "ASSIGNED"], to: "IN_TRANSIT", allowed: isCourier },
  pickup: { from: ["IN_TRANSIT"], to: "PICKED_UP", allowed: isCourier },
  complete: { from: ["PICKED_UP"], to: "COMPLETED", allowed: (u, r) => isRequester(u, r) || isDonor(u, r) },
  cancel: { from: ["PENDING", "APPROVED", "ASSIGNED"], to: "CANCELLED", allowed: isRequester },
};

function mayPerform(user, action, request) {
  const rule = TRANSITIONS[action];
  if (!rule.from.includes(request.status)) return false;
  if (user.role === "ADMIN") return action !== "claim";
  return rule.allowed(user, request);
}

// Actions this user can currently take (the UI renders its buttons from this list).
export function availableActions(user, request) {
  return Object.keys(TRANSITIONS).filter((action) => mayPerform(user, action, request));
}

export async function applyAction(requestId, actor, action, note = "") {
  const rule = TRANSITIONS[action];
  if (!rule) throw new ApiError(400, "Unknown action.");

  const request = await PickupRequest.findById(requestId);
  if (!request) throw new ApiError(404, "Pickup request not found.");

  const roleAllowed =
    actor.role === "ADMIN" ? action !== "claim" : rule.allowed(actor, request);
  if (!roleAllowed) throw new ApiError(403, "You are not allowed to do that.");
  if (!rule.from.includes(request.status)) {
    throw new ApiError(409, `This request is ${request.status}, so it cannot be changed this way.`);
  }

  const listing = await FoodListing.findById(request.listing);
  if (!listing) throw new ApiError(404, "Food listing not found.");
  const before = request.status;

  // Approving reserves the quantity. The conditions inside the update make it atomic:
  // two donors/admins approving at the same moment cannot over-book the food.
  if (action === "approve") {
    const reserved = await FoodListing.findOneAndUpdate(
      {
        _id: listing._id,
        status: "AVAILABLE",
        expiresAt: { $gt: new Date() },
        availableQuantity: { $gte: request.quantity },
      },
      { $inc: { availableQuantity: -request.quantity } }
    );
    if (!reserved) {
      throw new ApiError(409, "Not enough food is left, or the listing has expired or is unavailable.");
    }
  }

  const changes = { status: rule.to };
  if (action === "claim") changes.volunteer = actor._id;

  const updated = await PickupRequest.findOneAndUpdate(
    { _id: request._id, status: { $in: rule.from } }, // blocks double-clicks / races
    { $set: changes },
    { new: true }
  );
  if (!updated) {
    if (action === "approve") {
      await FoodListing.updateOne({ _id: listing._id }, { $inc: { availableQuantity: request.quantity } });
    }
    throw new ApiError(409, "Someone just updated this request. Refresh and try again.");
  }

  // Cancelling a reserved request gives the food back.
  if (action === "cancel" && ["APPROVED", "ASSIGNED"].includes(before)) {
    await FoodListing.updateOne({ _id: listing._id }, { $inc: { availableQuantity: request.quantity } });
  }

  await syncListingStatus(listing._id);
  await PickupHistory.create({
    request: request._id,
    listing: listing._id,
    actor: actor._id,
    action,
    fromStatus: before,
    toStatus: rule.to,
    note,
  });

  await sendNotifications(action, updated, listing, actor);
  return updated;
}

async function sendNotifications(action, request, listing, actor) {
  const send = async (userIds, type, message) => {
    for (const id of userIds) {
      if (id && !sameId(id, actor._id)) await notify(id, type, message);
    }
  };
  const name = `"${listing.name}"`;

  if (action === "approve") await send([request.requester], "REQUEST_APPROVED", `Your pickup request for ${name} was approved.`);
  if (action === "reject") await send([request.requester], "REQUEST_REJECTED", `Your pickup request for ${name} was rejected.`);
  if (action === "claim") await send([request.requester, request.donor], "VOLUNTEER_ASSIGNED", `A volunteer will handle the pickup of ${name}.`);
  if (action === "pickup") await send([request.requester, request.donor], "GENERAL", `${name} has been picked up.`);
  if (action === "complete") await send([request.requester, request.donor, request.volunteer], "PICKUP_COMPLETED", `The pickup of ${name} is complete. Thank you!`);
  if (action === "cancel") await send([request.donor, request.volunteer], "GENERAL", `A pickup request for ${name} was cancelled.`);
}

// Used when a listing is deleted or suspended: pending requests can no longer be served.
export async function closePendingRequests(listing, actor, message) {
  const pending = await PickupRequest.find({ listing: listing._id, status: "PENDING" });
  for (const request of pending) {
    request.status = "REJECTED";
    await request.save();
    await PickupHistory.create({
      request: request._id,
      listing: listing._id,
      actor: actor._id,
      action: "reject",
      fromStatus: "PENDING",
      toStatus: "REJECTED",
      note: message,
    });
    await notify(request.requester, "REQUEST_REJECTED", message);
  }
}
