import { ApiError, handle, readBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { checkId, oneOf } from "@/lib/validate";
import FoodListing from "@/models/FoodListing";
import { notify } from "@/services/notify";
import { syncListingStatus } from "@/services/listings";
import { closePendingRequests } from "@/services/requests";

// Body: { action: "suspend" | "restore" }
export const PATCH = handle(async (request, { params }) => {
  const { id } = await params;
  checkId(id);
  const admin = await requireUser(["ADMIN"]);
  const body = await readBody(request);
  const action = oneOf(body.action, ["suspend", "restore"], "Action");

  const listing = await FoodListing.findById(id);
  if (!listing) throw new ApiError(404, "Food listing not found.");

  if (action === "suspend") {
    await closePendingRequests(listing, admin, `The listing "${listing.name}" was removed by an admin.`);
    listing.status = "CANCELLED";
    await listing.save();
    await notify(listing.donor, "GENERAL", `Your listing "${listing.name}" was suspended by an admin.`, "/dashboard");
  } else {
    if (listing.status !== "CANCELLED") throw new ApiError(409, "Only suspended listings can be restored.");
    listing.status = "AVAILABLE";
    await listing.save();
    await syncListingStatus(listing._id); // becomes EXPIRED if the time has passed
  }
  return Response.json({ ok: true });
});
