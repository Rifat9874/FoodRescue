import { handle } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { ALL_ROLES } from "@/lib/constants";
import { escapeRegex } from "@/lib/validate";
import User from "@/models/User";

export const GET = handle(async (request) => {
  await requireUser(["ADMIN"]);
  const params = new URL(request.url).searchParams;
  const filter = {};
  const role = params.get("role");
  if (ALL_ROLES.includes(role)) filter.role = role;
  const q = (params.get("q") || "").trim().slice(0, 80);
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: regex }, { email: regex }, { organizationName: regex }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200).lean(); // passwordHash is select:false
  return Response.json({ users });
});
