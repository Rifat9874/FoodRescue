import { ApiError, handle, readBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { checkId, text } from "@/lib/validate";
import PickupRequest from "@/models/PickupRequest";
import PickupHistory from "@/models/PickupHistory";
import { applyAction, sameId } from "@/services/requests";

// One request plus its history. Only people involved (or admin) may read it.
export const GET = handle(async (request, { params }) => {
  const { id } = await params;
  checkId(id);
  const user = await requireUser(["DONOR", "NGO", "VOLUNTEER", "ADMIN"]);

  const pickup = await PickupRequest.findById(id).lean();
  if (!pickup) throw new ApiError(404, "Pickup request not found.");

  const involved =
    user.role === "ADMIN" ||
    sameId(pickup.donor, user._id) ||
    sameId(pickup.requester, user._id) ||
    sameId(pickup.volunteer, user._id) ||
    (user.role === "VOLUNTEER" && pickup.status === "APPROVED" && !pickup.volunteer);
  if (!involved) throw new ApiError(403, "You do not have access to this request.");

  const history = await PickupHistory.find({ request: id })
    .sort({ createdAt: 1 })
    .populate("actor", "name role")
    .lean();
  return Response.json({ request: pickup, history });
});

// Body: { action: "approve" | "reject" | "claim" | "start" | "pickup" | "complete" | "cancel", note? }
export const PATCH = handle(async (request, { params }) => {
  const { id } = await params;
  checkId(id);
  const user = await requireUser(["DONOR", "NGO", "VOLUNTEER", "ADMIN"]);
  const body = await readBody(request);
  const action = text(body.action, "Action", { max: 20 });
  const note = text(body.note, "Note", { optional: true, max: 300 });

  const updated = await applyAction(id, user, action, note);
  return Response.json({ request: updated });
});
