import bcrypt from "bcryptjs";
import { ApiError, handle, readBody } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { publicUser, setSessionCookie } from "@/lib/auth";
import { emailAddress } from "@/lib/validate";
import User from "@/models/User";

export const POST = handle(async (request) => {
  const body = await readBody(request);
  const email = emailAddress(body.email);
  if (typeof body.password !== "string" || !body.password) {
    throw new ApiError(400, "Password is required.");
  }

  await connectDB();
  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordMatches = user ? await bcrypt.compare(body.password, user.passwordHash) : false;

  // Same message for "no such email" and "wrong password" so attackers learn nothing.
  if (!passwordMatches) throw new ApiError(401, "Invalid email or password.");
  if (user.isSuspended) throw new ApiError(403, "This account has been suspended.");

  await setSessionCookie(user);
  return Response.json({ user: publicUser(user) });
});
