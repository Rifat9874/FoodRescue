// Creates (or resets) the first admin account.
// Run with: npm run create-admin   (reads .env.local)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first.");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const users = mongoose.connection.collection("users");
const email = ADMIN_EMAIL.toLowerCase().trim();
const now = new Date();

await users.updateOne(
  { email },
  {
    $set: {
      name: "Platform Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      isVerified: true,
      isSuspended: false,
      updatedAt: now,
    },
    $setOnInsert: { organizationName: "", phone: "", address: "", createdAt: now },
  },
  { upsert: true }
);

console.log(`Admin account ready: ${email}`);
await mongoose.disconnect();
