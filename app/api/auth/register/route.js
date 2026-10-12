import bcrypt from "bcryptjs";
import { ApiError, handle, readBody } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { publicUser, setSessionCookie } from "@/lib/auth";
import { REGISTER_ROLES } from "@/lib/constants";
import { emailAddress, oneOf, password, text } from "@/lib/validate";
import User from "@/models/User";

export const POST = handle(async (request) => {
  const body = await readBody(request);
  await connectDB();

  // ADMIN is not in REGISTER_ROLES, so nobody can sign up as admin.
  const role = oneOf(body.role, REGISTER_ROLES, "Role");
  const needsOrganization = role !== "VOLUNTEER";

  const data = {
    name: text(body.name, "Name", { min: 2, max: 80 }),
    email: emailAddress(body.email),
    role,
    organizationName: text(body.organizationName, "Organization name", {
      min: 2,
      max: 120,
      optional: !needsOrganization,
    }),
    phone: text(body.phone, "Phone", { optional: true, max: 30 }),
    address: text(body.address, "Address", { optional: true, max: 200 }),
  };
  const plainPassword = password(body.password);

  if (await User.exists({ email: data.email })) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const user = await User.create({
    ...data,
    passwordHash: await bcrypt.hash(plainPassword, 10),
    isVerified: role === "VOLUNTEER", // NGOs and donors wait for admin verification
  });

  await setSessionCookie(user);
  return Response.json({ user: publicUser(user) }, { status: 201 });
});
