import Link from "next/link";
import { connectDB } from "@/lib/db";
import FoodListing from "@/models/FoodListing";
import FoodCard from "@/components/FoodCard";
import Icon from "@/components/Icon";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES, CATEGORY_INFO } from "@/lib/constants";
import { getPlatformStats } from "@/services/stats";
import { runMaintenance } from "@/services/maintenance";

export const dynamic = "force-dynamic"; // always read live data from MongoDB

// This is a Server Component: it queries MongoDB directly, no API call needed.
async function loadHomeData() {
  try {
    await connectDB();
    await runMaintenance();
    const [stats, listings, categoryRows] = await Promise.all([
      getPlatformStats(),
      FoodListing.find({ status: "AVAILABLE", expiresAt: { $gt: new Date() }, availableQuantity: { $gt: 0 } })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate("donor", "name organizationName isVerified")
        .lean(),
      FoodListing.aggregate([
        { $match: { status: "AVAILABLE", expiresAt: { $gt: new Date() }, availableQuantity: { $gt: 0 } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);
    const counts = Object.fromEntries(categoryRows.map((r) => [r._id, r.count]));
    return { stats, listings: JSON.parse(JSON.stringify(listings)), counts };
  } catch {
    return { stats: null, listings: [], counts: {} };
  }
}

const STEPS = [
  { title: "Donors post surplus food", text: "Restaurants, bakeries and caterers list safe food with quantity, location and an expiry time." },
  { title: "NGOs request a pickup", text: "Verified organizations browse available food and request the amount they need." },
  { title: "Donor approves, volunteer helps", text: "The donor approves the request. A volunteer can take the pickup if the NGO needs help." },
  { title: "Food reaches people", text: "The pickup is completed and every step is recorded for full transparency." },
];

const TRUST = [
  { icon: "shield", title: "Verified organizations", text: "Admins verify donors and NGOs before they can request food." },
  { icon: "clock", title: "Expiry-aware", text: "Expired food can never be requested and disappears automatically." },
  { icon: "scale", title: "No double-booking", text: "Quantities are reserved atomically, so two NGOs never claim the same food." },
  { icon: "list", title: "Full pickup history", text: "Every status change is logged, from request to completed hand-over." },
];

const ROLES = [
  {
    icon: "utensils", title: "For donors",
    points: ["Post surplus food in under a minute", "Approve or reject incoming requests", "Track how many meals you rescued"],
    cta: "Join as a donor",
  },
  {
    icon: "heart", title: "For NGOs",
    points: ["Browse nearby food in real time", "Request exactly the quantity you need", "Follow each pickup until it is complete"],
    cta: "Join as an NGO",
  },
  {
    icon: "truck", title: "For volunteers",
    points: ["Take approved pickup tasks", "Help NGOs without transport", "Build a record of community impact"],
    cta: "Join as a volunteer",
  },
];

export default async function HomePage() {
  const { stats, listings, counts } = await loadHomeData();
  const heroStats = stats
    ? [["Meals rescued", stats.mealsRescued], ["Completed pickups", stats.completedPickups], ["Food available now", stats.availableListings]]
    : null;

  return (
    <main>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">Surplus food rescue platform</span>
            <h1>Turn surplus food into <em>shared meals.</em></h1>
            <p className="lead">
              Every day, safe food from restaurants, hotels and events is thrown away while people
              nearby go hungry. FoodRescue links donors with verified NGOs and volunteers so the
              food gets eaten, not wasted.
            </p>
            <div className="gap">
              <Link className="btn btn-light btn-lg" href="/donate">Donate food <Icon name="arrow" size={16} /></Link>
              <Link className="btn btn-outline btn-lg" href="/food">Find available food</Link>
            </div>
          </div>
          {heroStats && (
            <aside className="hero-card" aria-label="Live impact">
              <h2>Live impact</h2>
              {heroStats.map(([label, value]) => (
                <div className="hero-stat" key={label}><strong>{value}</strong><span>{label}</span></div>
              ))}
            </aside>
          )}
        </div>
      </section>

      <section className="section container" id="how-it-works">
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>From surplus to shared meal in four steps</h2>
          <p>A simple, trackable hand-over between people who have extra food and people who need it.</p>
        </div>
        <div className="steps">
          {STEPS.map((s, i) => (
            <div className="card step" key={s.title}>
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <span className="eyebrow">Browse by category</span>
          <h2>What kind of food are you looking for?</h2>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((name) => (
            <Link key={name} href={`/food?category=${encodeURIComponent(name)}`} className="card card-hover category-card">
              <div className="stat-icon"><Icon name={CATEGORY_INFO[name].icon} size={24} /></div>
              <strong>{name}</strong>
              <span>{CATEGORY_INFO[name].blurb}</span>
              <div style={{ marginTop: ".5rem" }}><span className="tag">{counts[name] || 0} available</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="section container">
          <div className="row" style={{ marginBottom: "1.5rem" }}>
            <div>
              <span className="eyebrow">Fresh listings</span>
              <h2 style={{ margin: 0 }}>Available food right now</h2>
            </div>
            <Link className="btn btn-outline btn-sm" href="/food">See all <Icon name="arrow" size={14} /></Link>
          </div>
          {listings.length === 0 ? (
            <EmptyState
              icon="utensils"
              title="No food is listed at the moment"
              action={<Link className="btn" href="/register">Post a donation</Link>}
            >
              New listings appear here as soon as donors post them. Check back soon.
            </EmptyState>
          ) : (
            <div className="grid">{listings.map((l) => <FoodCard key={l._id} listing={l} />)}</div>
          )}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <span className="eyebrow">Built for trust</span>
          <h2>Safe, fair and fully transparent</h2>
        </div>
        <div className="grid-3">
          {TRUST.map((t) => (
            <div className="card stat" key={t.title} style={{ alignItems: "flex-start" }}>
              <div className="stat-icon"><Icon name={t.icon} size={22} /></div>
              <div>
                <strong style={{ fontSize: "1.05rem" }}>{t.title}</strong>
                <span>{t.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="section container">
          <div className="section-head">
            <span className="eyebrow">Who it is for</span>
            <h2>There is a place for everyone</h2>
          </div>
          <div className="grid-3">
            {ROLES.map((r) => (
              <div className="card role-card" key={r.title}>
                <div className="stat-icon"><Icon name={r.icon} size={22} /></div>
                <h3>{r.title}</h3>
                <ul>{r.points.map((p) => <li key={p}>{p}</li>)}</ul>
                <Link className="btn btn-outline btn-sm" href="/register">{r.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {stats && (
        <section className="section container">
          <div className="section-head">
            <span className="eyebrow">Community</span>
            <h2>Our growing network</h2>
          </div>
          <div className="grid-3">
            {[
              ["utensils", "Listings posted", stats.totalListings],
              ["list", "Pickup requests", stats.totalRequests],
              ["scale", "Kg rescued", stats.kgRescued],
              ["leaf", "Donors", stats.donors],
              ["heart", "NGOs", stats.ngos],
              ["truck", "Volunteers", stats.volunteers],
            ].map(([icon, label, value]) => (
              <div className="card stat" key={label}>
                <div className="stat-icon"><Icon name={icon} size={22} /></div>
                <div><strong>{value}</strong><span>{label}</span></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="cta">
        <div className="container">
          <h2>Ready to rescue food?</h2>
          <p>Create a free account and make your first listing or request in minutes.</p>
          <Link className="btn btn-light btn-lg" href="/register">Get started <Icon name="arrow" size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
