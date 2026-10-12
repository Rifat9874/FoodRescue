import { handle } from "@/lib/api";
import { getCurrentUser, publicUser } from "@/lib/auth";

// Returns { user: null } for guests (not an error), so the navbar can ask safely.
export const GET = handle(async () => {
  const user = await getCurrentUser();
  return Response.json({ user: user ? publicUser(user) : null });
});
