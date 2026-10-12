import { ApiError, handle, readBody } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { CATEGORIES, CONDITIONS, FOOD_STATUS } from "@/lib/constants";
import { escapeRegex } from "@/lib/validate";
import FoodListing from "@/models/FoodListing";
import { parseListing } from "@/services/listings";
import { runMaintenance } from "@/services/maintenance";

const PUBLIC_STATUSES = ["AVAILABLE", "RESERVED"];
const PAGE_SIZE = 24;

// Public: browse listings. Query: q, category, condition, location, status, sort, page, mine=1, all=1 (admin)
export const GET = handle(async (request) => {
  await connectDB();
  await runMaintenance();

  const params = new URL(request.url).searchParams;
  const user = await getCurrentUser();
  const mine = params.get("mine") === "1";
  const adminAll = user?.role === "ADMIN" && params.get("all") === "1";
  const seesAllStatuses = mine || adminAll;

  const filter = {};
  if (mine) {
    if (!user) throw new ApiError(401, "Please log in to continue.");
    filter.donor = user._id;
  }

  const status = params.get("status");
  const allowedStatuses = seesAllStatuses ? FOOD_STATUS : PUBLIC_STATUSES;
  if (status && allowedStatuses.includes(status)) filter.status = status;
  else if (!seesAllStatuses) filter.status = "AVAILABLE";

  // Only genuinely requestable food is listed as "AVAILABLE".
  if (filter.status === "AVAILABLE") {
    filter.expiresAt = { $gt: new Date() };
    filter.availableQuantity = { $gt: 0 };
  }

  const q = (params.get("q") || "").trim().slice(0, 80);
  if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

  const location = (params.get("location") || "").trim().slice(0, 80);
  if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };

  const category = params.get("category");
  if (CATEGORIES.includes(category)) filter.category = category;

  const condition = params.get("condition");
  if (CONDITIONS.includes(condition)) filter.condition = condition;

  const sort = params.get("sort") === "expiry" ? { expiresAt: 1 } : { createdAt: -1 };
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);

  const [listings, total] = await Promise.all([
    FoodListing.find(filter)
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate("donor", "name organizationName isVerified")
      .lean(),
    FoodListing.countDocuments(filter),
  ]);

  return Response.json({ listings, total, page, pages: Math.ceil(total / PAGE_SIZE) });
});

// Donor only: create a listing.
export const POST = handle(async (request) => {
  const user = await requireUser(["DONOR"]);
  const data = parseListing(await readBody(request));
  const listing = await FoodListing.create({
    ...data,
    donor: user._id,
    availableQuantity: data.quantity,
  });
  return Response.json({ listing }, { status: 201 });
});
