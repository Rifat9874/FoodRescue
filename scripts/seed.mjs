// Fills the database with realistic demo data. Every field of every collection is filled in.
//
//   npm run seed            wipe old demo data, then insert fresh demo data
//   npm run seed:clear      remove demo data only
//   npm run seed -- --dry   build the data and print a summary without touching the database
//
// Demo accounts all use the password  Demo@1234  and end with @demo.foodrescue.test
// Only documents that belong to those demo users are ever deleted. Your real data is safe.
import { createRequire } from "node:module";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const GALLERY = createRequire(import.meta.url)("../lib/gallery.json");
const imageOf = (id) => {
  const image = GALLERY.find((g) => g.id === id);
  if (!image) throw new Error(`Unknown gallery image: ${id}`);
  return image.src;
};

const DOMAIN = "@demo.foodrescue.test";
const PASSWORD = "Demo@1234";
const args = new Set(process.argv.slice(2));
const HOUR = 3600 * 1000;
const MIN = 60 * 1000;
const now = Date.now();
const at = (hoursFromNow) => new Date(now + hoursFromNow * HOUR);
const oid = () => new mongoose.Types.ObjectId();

// ------------------------------------------------------------------ users (40) ----
// [contact name, organization, area]
const DONORS = [
  ["Rahim Uddin", "Star Kabab & Biryani House", "Dhanmondi"],
  ["Nusrat Jahan", "Golden Crust Bakery", "Gulshan"],
  ["Tanvir Ahmed", "Green Basket Grocery", "Mirpur"],
  ["Farhana Akter", "Spice Garden Restaurant", "Banani"],
  ["Imran Hossain", "Hotel Lake View", "Uttara"],
  ["Sadia Islam", "Daily Fresh Dairy", "Mohammadpur"],
  ["Kamal Hasan", "City Café & Sweets", "Motijheel"],
  ["Mitu Rahman", "Wedding Hall Catering", "Bashundhara"],
  ["Arif Chowdhury", "Metro Mini Mart", "Badda"],
  ["Nazmul Haque", "Royal Sweets & Bakery", "Old Dhaka"],
  ["Sharmin Sultana", "Fresh Harvest Farmers' Market", "Khilgaon"],
  ["Tarek Aziz", "Skyline Conference Centre", "Gulshan"],
];
const NGOS = [
  ["Salma Begum", "Hope Kitchen Foundation", "Kamrangirchar"],
  ["Rafiq Mia", "Shelter for Street Children", "Kawran Bazar"],
  ["Dr. Anwar Hossain", "Community Care Trust", "Jatrabari"],
  ["Shirin Sultana", "Women's Meal Network", "Tejgaon"],
  ["Habib Rahman", "Orphan Smile Home", "Mirpur 10"],
  ["Lutfa Khatun", "Elderly Care Centre", "Mohakhali"],
  ["Mahmud Alam", "Rickshaw Pullers Welfare", "Sadarghat"],
  ["Rina Das", "Slum Education Project", "Korail"],
  ["Jahangir Khan", "Open Door Shelter", "Demra"],
  ["Parveen Akhter", "New Dawn Charity", "Rampura"],
  ["Moinul Islam", "Street Meals Dhaka", "Farmgate"],
  ["Taslima Nasrin", "Care for Mothers Society", "Shyamoli"],
  ["Babul Mia", "Garment Workers Meal Fund", "Savar"],
  ["Anika Tabassum", "Little Hands Orphanage", "Uttara Sector 11"],
];
const VOLUNTEERS = [
  "Sakib Hasan", "Tasnim Ara", "Mehedi Hasan", "Rumana Ferdous", "Zahid Karim",
  "Ayesha Siddiqua", "Shuvo Dey", "Nabila Chowdhury", "Fahim Reza", "Sumaiya Khan",
  "Rakib Hossain", "Mahira Zaman", "Omar Faruk",
];

const phone = (n) => `+88017${String(10000000 + n * 7919).slice(0, 8)}`;
const passwordHash = args.has("--clear") ? "" : await bcrypt.hash(PASSWORD, 10);

function buildUsers() {
  const users = [];
  const add = (extra) => {
    const n = users.length;
    const created = at(-24 * (90 - n));
    users.push({
      _id: oid(),
      passwordHash,
      phone: phone(n + 1),
      isVerified: true,
      isSuspended: false,
      createdAt: created,
      updatedAt: created,
      ...extra,
    });
  };
  add({ name: "Demo Admin", email: `admin${DOMAIN}`, role: "ADMIN", organizationName: "FoodRescue Platform Team", address: "Level 4, Tech Hub, Gulshan 2, Dhaka" });
  DONORS.forEach(([name, org, area], i) =>
    add({ name, email: `donor${i + 1}${DOMAIN}`, role: "DONOR", organizationName: org, address: `House ${10 + i * 3}, Road ${i + 2}, ${area}, Dhaka`, isVerified: i !== 11 })
  );
  NGOS.forEach(([name, org, area], i) =>
    add({ name, email: `ngo${i + 1}${DOMAIN}`, role: "NGO", organizationName: org, address: `${org}, ${area}, Dhaka`, isVerified: i < 12 })
  );
  VOLUNTEERS.forEach((name, i) =>
    add({ name, email: `volunteer${i + 1}${DOMAIN}`, role: "VOLUNTEER", organizationName: "Independent volunteer", address: `Flat ${i + 3}B, Road ${i + 5}, Dhaka`, isSuspended: i === 12 })
  );
  return users;
}

// ------------------------------------------------------------- food listings (40) ----
// [gallery id, name, category, quantity, unit, condition, description]
const FOOD = [
  ["chicken-biryani", "Chicken Biryani", "Cooked Meals", 40, "portions", "Freshly cooked", "Leftover from today's lunch service. Kept hot and packed in clean food-grade containers."],
  ["vegetable-curry", "Mixed Vegetable Curry", "Cooked Meals", 30, "portions", "Freshly cooked", "Seasonal vegetables cooked with mild spices, suitable for everyone including children."],
  ["lentil-soup", "Lentil Soup", "Cooked Meals", 25, "portions", "Freshly cooked", "Warm, protein-rich dal soup prepared this morning. Bring your own pots or we can pack it in cups."],
  ["fried-rice", "Vegetable Fried Rice", "Cooked Meals", 35, "portions", "Freshly cooked", "Event surplus packed in individual boxes with a spoon in each."],
  ["pasta-marinara", "Pasta Marinara", "Cooked Meals", 20, "portions", "Freshly cooked", "Tomato and basil pasta from the evening buffet. Vegetarian."],
  ["mixed-khichuri", "Mixed Khichuri", "Cooked Meals", 50, "portions", "Freshly cooked", "Rice and lentil khichuri cooked for a community event, plenty left."],
  ["sourdough-loaf", "Sourdough Loaf", "Bakery", 18, "pieces", "Packaged & sealed", "Baked today. Unsold loaves wrapped in paper bags."],
  ["butter-croissants", "Butter Croissants", "Bakery", 36, "pieces", "Packaged & sealed", "Fresh croissants from the morning batch, boxed in dozens."],
  ["chocolate-cake", "Chocolate Cake Slices", "Bakery", 24, "pieces", "Refrigerated", "Individually boxed slices, stored in the fridge since baking."],
  ["glazed-donuts", "Glazed Donuts", "Bakery", 48, "pieces", "Packaged & sealed", "Assorted glazed donuts baked this morning, packed in boxes of six."],
  ["dinner-rolls", "Soft Dinner Rolls", "Bakery", 60, "pieces", "Packaged & sealed", "Bags of 6 rolls, ideal for shelters and community kitchens."],
  ["red-apples", "Red Apples", "Fruits & Vegetables", 25, "kg", "Fresh produce", "Slightly bruised but perfectly good apples, sorted and crated."],
  ["ripe-bananas", "Ripe Bananas", "Fruits & Vegetables", 30, "kg", "Fresh produce", "Very ripe, best eaten or used for baking within a day."],
  ["fresh-oranges", "Fresh Oranges", "Fruits & Vegetables", 40, "kg", "Fresh produce", "Juicy oranges from a surplus delivery. Cosmetic marks only."],
  ["ripe-tomatoes", "Ripe Tomatoes", "Fruits & Vegetables", 35, "kg", "Fresh produce", "Good for cooking. Cosmetic marks only, no spoilage."],
  ["fresh-carrots", "Fresh Carrots", "Fruits & Vegetables", 28, "kg", "Fresh produce", "Crunchy carrots, washed and crated this morning."],
  ["biscuit-box", "Biscuit Boxes", "Packaged Food", 80, "packs", "Packaged & sealed", "Sealed boxes with 3 months to expiry. Outer carton slightly damaged."],
  ["canned-beans", "Canned Beans", "Packaged Food", 60, "packs", "Packaged & sealed", "Sealed cans with a long shelf life, labels intact."],
  ["instant-noodles", "Instant Noodles", "Packaged Food", 100, "packs", "Packaged & sealed", "Unopened multipacks close to best-before date, still fully safe."],
  ["breakfast-cereal", "Breakfast Cereal", "Packaged Food", 45, "packs", "Packaged & sealed", "Sealed cereal boxes, good for children's homes."],
  ["orange-juice", "Orange Juice Bottles", "Beverages", 48, "pieces", "Refrigerated", "Chilled 500 ml bottles, expiring in two days."],
  ["drinking-water", "Drinking Water Bottles", "Beverages", 120, "pieces", "Packaged & sealed", "Sealed 1 litre bottles left over from a conference."],
  ["masala-tea", "Masala Tea (flasks)", "Beverages", 40, "litres", "Freshly cooked", "Freshly brewed tea in insulated flasks. Cups available on request."],
  ["mango-juice-pack", "Mango Juice Packs", "Beverages", 72, "packs", "Packaged & sealed", "Tetra packs with two weeks left on the date."],
  ["fresh-milk", "Fresh Milk Cartons", "Dairy", 50, "litres", "Refrigerated", "Pasteurised milk kept cold, expires tomorrow."],
  ["yogurt-cups", "Yogurt Cups", "Dairy", 90, "pieces", "Refrigerated", "Sweet yogurt cups kept refrigerated at all times."],
  ["cheese-wedge", "Cheese Wedges", "Dairy", 30, "packs", "Refrigerated", "Sealed cheese packs from a supplier overstock."],
  ["grocery-basket", "Mixed Grocery Baskets", "Other", 15, "packs", "Fresh produce", "Baskets with vegetables, fruit and pantry staples."],
  ["sandwich-lunchbox", "Packed Lunch Boxes", "Other", 45, "packs", "Freshly cooked", "Sandwich lunch boxes from a cancelled meeting, packed this morning."],
  ["snack-hamper", "Snack Hampers", "Other", 20, "packs", "Packaged & sealed", "Festival hampers with dry snacks and drinks."],
  // second batch: more of what NGOs ask for most
  ["chicken-biryani", "Chicken Biryani – Family Trays", "Cooked Meals", 12, "packs", "Freshly cooked", "Large aluminium trays, each feeds about eight people. Reheat before serving."],
  ["lentil-soup", "Dal Soup Cartons", "Cooked Meals", 45, "portions", "Freshly cooked", "Takeaway cartons of thick dal soup from the staff canteen."],
  ["sourdough-loaf", "Whole Wheat Bread Loaves", "Bakery", 40, "pieces", "Packaged & sealed", "Sliced whole wheat bread, baked this morning."],
  ["dinner-rolls", "Cinnamon Rolls", "Bakery", 32, "pieces", "Packaged & sealed", "Sweet rolls from the weekend batch, individually wrapped."],
  ["red-apples", "Apples (Mixed Grades)", "Fruits & Vegetables", 50, "kg", "Fresh produce", "Mixed sizes from a wholesale clearance, all edible."],
  ["fresh-oranges", "Sweet Oranges (Crates)", "Fruits & Vegetables", 60, "kg", "Fresh produce", "Full crates, collection by van recommended."],
  ["instant-noodles", "Instant Noodle Cartons", "Packaged Food", 36, "packs", "Packaged & sealed", "Whole cartons of 24, unopened."],
  ["drinking-water", "Bottled Mineral Water Crates", "Beverages", 30, "packs", "Packaged & sealed", "Crates of 12 bottles from an event."],
  ["fresh-milk", "Full Cream Milk Packs", "Dairy", 60, "litres", "Refrigerated", "1 litre packs, cold chain maintained."],
  ["sandwich-lunchbox", "Office Lunch Boxes", "Other", 38, "packs", "Freshly cooked", "Rice and chicken curry boxes from a corporate event."],
];

// Request status for each listing's main request.
const STATUS_PLAN = [
  "PENDING", "APPROVED", "COMPLETED", "ASSIGNED", "PENDING", "IN_TRANSIT",
  "COMPLETED", "PENDING", "APPROVED", "PICKED_UP", "ASSIGNED", "COMPLETED",
  "PENDING", "REJECTED", "IN_TRANSIT", "PENDING", "COMPLETED", "APPROVED",
  "PICKED_UP", "PENDING", "COMPLETED", "ASSIGNED", "PENDING", "APPROVED",
  "COMPLETED", "PENDING", "CANCELLED", "REJECTED", "REJECTED", "CANCELLED",
  "PENDING", "APPROVED", "ASSIGNED", "COMPLETED", "PENDING", "IN_TRANSIT",
  "PICKED_UP", "PENDING", "APPROVED", "PENDING",
];
const RESERVING = ["APPROVED", "ASSIGNED", "IN_TRANSIT", "PICKED_UP", "COMPLETED"];
const NEEDS_VOLUNTEER = ["ASSIGNED", "IN_TRANSIT", "PICKED_UP", "COMPLETED"];
const MESSAGES = [
  "We serve about 60 people every evening and would be grateful for this.",
  "Our van can collect within an hour of approval.",
  "Please keep it packed separately, we will bring our own containers.",
  "Thank you for sharing. Our children's home really needs this.",
  "We run a weekly community lunch and this would cover most of it.",
  "We can pick up any time after 5 pm.",
  "Two of our volunteers are nearby and can collect immediately.",
  "This will go straight to families in our after-school programme.",
];
const NOTES = {
  create: "",
  approve: "Approved. Please bring your own containers.",
  reject: "Sorry, we have already promised the rest of this batch.",
  claim: "I can handle this pickup, nearby on my route.",
  start: "On my way to the pickup address.",
  pickup: "Collected, food was in good condition.",
  complete: "Delivered and served. Thank you!",
  cancel: "Plans changed on our side, sorry for the trouble.",
};
const AREAS = ["Dhanmondi", "Gulshan", "Mirpur", "Banani", "Uttara", "Mohammadpur", "Motijheel", "Bashundhara", "Badda", "Old Dhaka", "Khilgaon", "Gulshan"];

// What happened to a request, in order: [action, from, to, who]
const PATH = {
  PENDING: [["create", "", "PENDING", "requester"]],
  APPROVED: [["create", "", "PENDING", "requester"], ["approve", "PENDING", "APPROVED", "donor"]],
  ASSIGNED: [["create", "", "PENDING", "requester"], ["approve", "PENDING", "APPROVED", "donor"], ["claim", "APPROVED", "ASSIGNED", "volunteer"]],
  IN_TRANSIT: [["create", "", "PENDING", "requester"], ["approve", "PENDING", "APPROVED", "donor"], ["claim", "APPROVED", "ASSIGNED", "volunteer"], ["start", "ASSIGNED", "IN_TRANSIT", "volunteer"]],
  PICKED_UP: [["create", "", "PENDING", "requester"], ["approve", "PENDING", "APPROVED", "donor"], ["claim", "APPROVED", "ASSIGNED", "volunteer"], ["start", "ASSIGNED", "IN_TRANSIT", "volunteer"], ["pickup", "IN_TRANSIT", "PICKED_UP", "volunteer"]],
  COMPLETED: [["create", "", "PENDING", "requester"], ["approve", "PENDING", "APPROVED", "donor"], ["claim", "APPROVED", "ASSIGNED", "volunteer"], ["start", "ASSIGNED", "IN_TRANSIT", "volunteer"], ["pickup", "IN_TRANSIT", "PICKED_UP", "volunteer"], ["complete", "PICKED_UP", "COMPLETED", "requester"]],
  REJECTED: [["create", "", "PENDING", "requester"], ["reject", "PENDING", "REJECTED", "donor"]],
  CANCELLED: [["create", "", "PENDING", "requester"], ["cancel", "PENDING", "CANCELLED", "requester"]],
};

function build(users) {
  const donors = users.filter((u) => u.role === "DONOR");
  const ngos = users.filter((u) => u.role === "NGO" && u.isVerified);
  const volunteers = users.filter((u) => u.role === "VOLUNTEER" && !u.isSuspended);
  const listings = [];
  const requests = [];
  const history = [];
  const notifications = [];

  const notify = (user, type, message, link, when) => {
    if (!user) return;
    notifications.push({ _id: oid(), user, type, message, link, read: when.getTime() < now - 10 * HOUR, createdAt: when, updatedAt: when });
  };

  // Creates a request with its full history trail and the notifications the app would send.
  function addRequest({ listing, status, quantity, requester, volunteer, createdAt, seed }) {
    const steps = PATH[status];
    const request = {
      _id: oid(),
      listing: listing._id,
      donor: listing.donor,
      requester: requester._id,
      volunteer: volunteer?._id ?? null,
      quantity,
      unit: listing.unit,
      preferredTime: new Date(createdAt.getTime() + 3 * HOUR),
      message: MESSAGES[seed % MESSAGES.length],
      status,
      createdAt,
      updatedAt: createdAt,
    };
    const actor = { requester: requester._id, donor: listing.donor, volunteer: volunteer?._id };
    const food = `"${listing.name}"`;
    const org = requester.organizationName || requester.name;

    steps.forEach(([action, fromStatus, toStatus, who], k) => {
      const when = new Date(createdAt.getTime() + k * 35 * MIN);
      request.updatedAt = when;
      history.push({
        _id: oid(), request: request._id, listing: listing._id, actor: actor[who], action,
        fromStatus, toStatus, note: NOTES[action], createdAt: when,
      });
      // the same notifications the real workflow sends (services/requests.js)
      if (action === "create") notify(listing.donor, "NEW_REQUEST", `${org} requested ${quantity} ${listing.unit} of ${food}.`, "/requests", when);
      if (action === "approve") notify(requester._id, "REQUEST_APPROVED", `Your pickup request for ${food} was approved.`, "/requests", when);
      if (action === "reject") notify(requester._id, "REQUEST_REJECTED", `Your pickup request for ${food} was rejected.`, "/requests", when);
      if (action === "claim") for (const u of [requester._id, listing.donor]) notify(u, "VOLUNTEER_ASSIGNED", `A volunteer will handle the pickup of ${food}.`, "/requests", when);
      if (action === "pickup") for (const u of [requester._id, listing.donor]) notify(u, "GENERAL", `${food} has been picked up.`, "/requests", when);
      if (action === "complete") for (const u of [requester._id, listing.donor, volunteer?._id]) notify(u, "PICKUP_COMPLETED", `The pickup of ${food} is complete. Thank you!`, "/requests", when);
      if (action === "cancel") for (const u of [listing.donor, volunteer?._id]) notify(u, "GENERAL", `A pickup request for ${food} was cancelled.`, "/requests", when);
    });
    requests.push(request);
    return request;
  }

  FOOD.forEach(([image, name, category, quantity, unit, condition, description], i) => {
    const donor = donors[i % donors.length];
    const status = STATUS_PLAN[i];
    const reserves = RESERVING.includes(status);
    // every third reserving request takes the whole stock, the others about half
    const requested = reserves && i % 3 === 0 ? quantity : Math.max(1, Math.round(quantity * (reserves ? 0.5 : 0.3)));
    const availableQuantity = reserves ? quantity - requested : quantity;
    const finished = ["PICKED_UP", "COMPLETED"].includes(status);
    const cancelled = i === 28; // suspended by an admin
    const expired = i === 29; // nobody collected it in time

    let listingStatus;
    if (cancelled) listingStatus = "CANCELLED";
    else if (expired) listingStatus = "EXPIRED";
    else if (availableQuantity > 0) listingStatus = "AVAILABLE";
    else if (status === "COMPLETED") listingStatus = "COMPLETED";
    else if (status === "PICKED_UP") listingStatus = "PICKED_UP";
    else listingStatus = "RESERVED";

    const past = finished || expired || cancelled;
    const createdAt = at(-(4 + (FOOD.length - 1 - i) * 2.5));
    // a few available listings expire soon, so the "expires in" urgency and alerts show up
    const soon = !past && listingStatus === "AVAILABLE" && i % 9 === 4;
    const listing = {
      _id: oid(),
      donor: donor._id,
      name,
      category,
      quantity,
      availableQuantity,
      unit,
      description,
      location: `${donor.organizationName}, ${donor.address.split(",").slice(-2, -1)[0].trim() || AREAS[i % AREAS.length]}, Dhaka`,
      availableFrom: at(past ? -30 - (i % 5) : -(1 + (i % 4))),
      expiresAt: past ? at(-(2 + (i % 6))) : soon ? at(1.5) : at(3 + ((i * 7) % 46)),
      condition,
      imageUrl: imageOf(image),
      status: listingStatus,
      expiryNotified: soon,
      createdAt,
      updatedAt: createdAt,
    };
    listings.push(listing);
    if (soon) notify(donor._id, "LISTING_EXPIRING", `"${name}" expires within 2 hours.`, `/donate/${listing._id}`, at(-0.2));

    const requester = ngos[i % ngos.length];
    const volunteer = NEEDS_VOLUNTEER.includes(status) ? volunteers[i % volunteers.length] : null;
    addRequest({ listing, status, quantity: requested, requester, volunteer, createdAt: new Date(createdAt.getTime() + 20 * MIN), seed: i });

    // a second NGO also asked for some of the listings (never reserves stock)
    if (i % 4 === 1) {
      const second = past ? "REJECTED" : ["PENDING", "REJECTED", "CANCELLED"][(i >> 2) % 3];
      addRequest({
        listing, status: second, quantity: Math.max(1, Math.round(quantity * 0.2)),
        requester: ngos[(i + 3) % ngos.length], volunteer: null,
        createdAt: new Date(createdAt.getTime() + 50 * MIN), seed: i + 3,
      });
    }
  });
  return { listings, requests, history, notifications };
}

// ------------------------------------------------------------------- run ----
const users = buildUsers();
const { listings, requests, history, notifications } = build(users);
const summary = { users, foodListings: listings, pickupRequests: requests, pickupHistory: history, notifications };

if (args.has("--dry")) {
  console.log("Dry run OK. Would insert:");
  for (const [name, docs] of Object.entries(summary)) console.log(`  ${name}: ${docs.length}`);
  process.exit(0);
}

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
  console.error("Set MONGODB_URI in .env.local first (see .env.local.example).");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

// Remove previous demo data (only documents that belong to demo users).
const emailPattern = `${DOMAIN.replaceAll(".", "\\.")}$`;
const demoUsers = await db.collection("users").find({ email: { $regex: emailPattern } }, { projection: { _id: 1 } }).toArray();
const demoIds = demoUsers.map((u) => u._id);
if (demoIds.length) {
  const demoListings = await db.collection("foodListings").find({ donor: { $in: demoIds } }, { projection: { _id: 1 } }).toArray();
  const listingIds = demoListings.map((l) => l._id);
  await db.collection("pickupHistory").deleteMany({ listing: { $in: listingIds } });
  await db.collection("pickupRequests").deleteMany({ listing: { $in: listingIds } });
  await db.collection("notifications").deleteMany({ user: { $in: demoIds } });
  await db.collection("foodListings").deleteMany({ _id: { $in: listingIds } });
  await db.collection("users").deleteMany({ _id: { $in: demoIds } });
  console.log(`Removed previous demo data (${demoIds.length} demo users).`);
}

if (args.has("--clear")) {
  console.log("Demo data cleared.");
} else {
  for (const [name, docs] of Object.entries(summary)) {
    await db.collection(name).insertMany(docs);
    console.log(`  ${name}: inserted ${docs.length}`);
  }
  console.log(`\nDone. Log in with any demo account, password: ${PASSWORD}`);
  console.log(`  Admin      admin${DOMAIN}`);
  console.log(`  Donor      donor1${DOMAIN}  (… donor12)`);
  console.log(`  NGO        ngo1${DOMAIN}    (… ngo14, verified: ngo1-ngo12)`);
  console.log(`  Volunteer  volunteer1${DOMAIN} (… volunteer13)`);
}
await mongoose.disconnect();
