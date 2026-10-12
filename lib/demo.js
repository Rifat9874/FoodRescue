// Demo accounts created by `npm run seed`. Shown on the login page so visitors can explore
// every role in one click. Set NEXT_PUBLIC_DEMO_LOGINS=off to hide them in production.
export const DEMO_PASSWORD = "Demo@1234";

export const DEMO_ENABLED = process.env.NEXT_PUBLIC_DEMO_LOGINS !== "off";

export const DEMO_ACCOUNTS = [
  { role: "ADMIN", icon: "shield", email: "admin@demo.foodrescue.test", title: "Admin", text: "Verify users, manage listings and see every pickup" },
  { role: "DONOR", icon: "utensils", email: "donor1@demo.foodrescue.test", title: "Donor", text: "Star Kabab & Biryani House: post food, approve requests" },
  { role: "NGO", icon: "heart", email: "ngo1@demo.foodrescue.test", title: "NGO", text: "Hope Kitchen Foundation: browse food and request pickups" },
  { role: "VOLUNTEER", icon: "truck", email: "volunteer1@demo.foodrescue.test", title: "Volunteer", text: "Sakib Hasan: take approved pickup tasks" },
];
