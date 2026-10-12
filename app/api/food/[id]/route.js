import { ApiError, handle, readBody } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ACTIVE_REQUEST_STATUS } from "@/lib/constants";
import { checkId } from "@/lib/validate";
import FoodListing from "@/models/FoodListing";
import PickupRequest from "@/models/PickupRequest";
import { loadManagedListing, parseListing, syncListingStatus } from "@/services/listings";
import { runMaintenance } from "@/services/maintenance";
import { closePendingRequests } from "@/services/requests";

export const GET = handle(async (request, { params }) => {
  const { id } = await params;
  checkId(id);
  await connectDB();
  await runMaintenance();
  const listing = await FoodListing.findById(id)
    .populate("donor", "name organizationName isVerified")
    .lean();
  if (!listing) throw new ApiError(404, "Food listing not found.");
  return Response.json({ listing });
});

export const PUT = handle(async (request, { params }) => {
  const { id } = await params;
  const user = await requireUser(["DONOR", "ADMIN"]);
  const listing = await loadManagedListing(id, user);

  if (["CANCELLED", "COMPLETED", "PICKED_UP"].includes(listing.status)) {
    throw new ApiError(409, `A ${listing.status.toLowerCase().replace("_", " ")} listing cannot be edited.`);
  }

  const data = parseListing(await readBody(request));
  const reserved = listing.quantity - listing.availableQuantity;
  if (data.quantity < reserved) {
    throw new ApiError(400, `${reserved} ${listing.unit} are already reserved, so quantity cannot be lower.`);
  }

  Object.assign(listing, data, {
    availableQuantity: data.quantity - reserved,
    expiryNotified: false,
  });
  await listing.save();
  const updated = await syncListingStatus(listing._id);
  return Response.json({ listing: updated });
});

export const DELETE = handle(async (request, { params }) => {
  const { id } = await params;
  const user = await requireUser(["DONOR", "ADMIN"]);
  const listing = await loadManagedListing(id, user);

  const active = await PickupRequest.countDocuments({
    listing: listing._id,
    status: { $in: ACTIVE_REQUEST_STATUS },
  });
  if (active > 0) {
    throw new ApiError(409, "This listing has active pickups. Complete or cancel them first.");
  }

  await closePendingRequests(listing, user, `The listing "${listing.name}" was removed by the donor.`);

  // Keep the record if requests ever existed (history), otherwise remove it completely.
  const anyRequests = await PickupRequest.countDocuments({ listing: listing._id });
  if (anyRequests === 0) {
    await listing.deleteOne();
  } else {
    listing.status = "CANCELLED";
    await listing.save();
  }
  return Response.json({ ok: true });
});
