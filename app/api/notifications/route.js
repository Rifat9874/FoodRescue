import { handle, readBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { checkId } from "@/lib/validate";
import Notification from "@/models/Notification";
import { runMaintenance } from "@/services/maintenance";

export const GET = handle(async () => {
  const user = await requireUser(["DONOR", "NGO", "VOLUNTEER", "ADMIN"]);
  await runMaintenance();
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ user: user._id, read: false }),
  ]);
  return Response.json({ notifications, unread });
});

// Body: {} marks all as read, { id } marks one as read.
export const PATCH = handle(async (request) => {
  const user = await requireUser(["DONOR", "NGO", "VOLUNTEER", "ADMIN"]);
  const body = await readBody(request);
  const filter = { user: user._id, read: false };
  if (body.id) filter._id = checkId(body.id);
  await Notification.updateMany(filter, { $set: { read: true } });
  return Response.json({ ok: true });
});
