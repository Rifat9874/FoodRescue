import { ApiError, handle, readBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { checkId } from "@/lib/validate";
import User from "@/models/User";
import { notify } from "@/services/notify";

// Body: { isVerified?: boolean, isSuspended?: boolean }
export const PATCH = handle(async (request, { params }) => {
  const { id } = await params;
  checkId(id);
  const admin = await requireUser(["ADMIN"]);
  const body = await readBody(request);

  const target = await User.findById(id);
  if (!target) throw new ApiError(404, "User not found.");
  if (target.role === "ADMIN") throw new ApiError(403, "Admin accounts cannot be changed here.");

  if (typeof body.isVerified === "boolean") {
    target.isVerified = body.isVerified;
    if (body.isVerified) {
      await notify(target._id, "GENERAL", "Your account has been verified by an admin.", "/dashboard");
    }
  }
  if (typeof body.isSuspended === "boolean") {
    if (String(target._id) === String(admin._id)) throw new ApiError(400, "You cannot suspend yourself.");
    target.isSuspended = body.isSuspended;
  }
  await target.save();
  return Response.json({ ok: true });
});
