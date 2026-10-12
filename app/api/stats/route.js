import { handle } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getPlatformStats } from "@/services/stats";

// Public aggregate numbers only (counts), calculated live from MongoDB.
export const GET = handle(async () => {
  await connectDB();
  return Response.json({ stats: await getPlatformStats() });
});
