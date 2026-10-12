export const REGISTER_ROLES = ["DONOR", "NGO", "VOLUNTEER"];
export const ALL_ROLES = ["DONOR", "NGO", "VOLUNTEER", "ADMIN"];

export const CATEGORIES = [
  "Cooked Meals",
  "Bakery",
  "Fruits & Vegetables",
  "Packaged Food",
  "Beverages",
  "Dairy",
  "Other",
];
// Display info for the category browser (icon names come from components/Icon.js).
export const CATEGORY_INFO = {
  "Cooked Meals": { icon: "utensils", blurb: "Ready-to-eat meals" },
  Bakery: { icon: "wheat", blurb: "Bread, cakes & pastries" },
  "Fruits & Vegetables": { icon: "apple", blurb: "Fresh produce" },
  "Packaged Food": { icon: "box", blurb: "Sealed & shelf-stable" },
  Beverages: { icon: "cup", blurb: "Juice, water & tea" },
  Dairy: { icon: "drop", blurb: "Milk, yogurt & cheese" },
  Other: { icon: "basket", blurb: "Hampers & mixed items" },
};

export const UNITS = ["portions", "kg", "pieces", "packs", "litres"];
export const CONDITIONS = [
  "Freshly cooked",
  "Packaged & sealed",
  "Refrigerated",
  "Fresh produce",
];

export const FOOD_STATUS = [
  "AVAILABLE",
  "RESERVED",
  "PICKED_UP",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
];

export const REQUEST_STATUS = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ASSIGNED",
  "IN_TRANSIT",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
];

// Requests that still hold food (or have already moved it)
export const ACTIVE_REQUEST_STATUS = ["APPROVED", "ASSIGNED", "IN_TRANSIT", "PICKED_UP"];

export const NOTIFICATION_TYPES = [
  "NEW_REQUEST",
  "REQUEST_APPROVED",
  "REQUEST_REJECTED",
  "VOLUNTEER_ASSIGNED",
  "PICKUP_COMPLETED",
  "LISTING_EXPIRING",
  "GENERAL",
];
