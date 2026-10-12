import Link from "next/link";
import StatusBadge from "./StatusBadge";
import LocalTime from "./LocalTime";
import Icon from "./Icon";
import { timeLeft } from "@/lib/format";

export default function FoodCard({ listing }) {
  const donor = listing.donor;
  const left = timeLeft(listing.expiresAt);
  const percent = listing.quantity ? Math.round((listing.availableQuantity / listing.quantity) * 100) : 0;

  return (
    <article className="card card-hover food-card">
      <div className="food-media">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="food-img" src={listing.imageUrl} alt={listing.name} loading="lazy" />
        ) : (
          <div className="food-placeholder"><Icon name="utensils" size={44} strokeWidth={1.5} /></div>
        )}
        <StatusBadge status={listing.status} />
      </div>
      <div className="card-body">
        <div><span className="tag">{listing.category}</span></div>
        <h3>{listing.name}</h3>

        <div className="meter" role="img" aria-label={`${percent}% of the food is still available`}>
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="small"><strong>{listing.availableQuantity}</strong> of {listing.quantity} {listing.unit} left</p>

        <div className="meta"><Icon name="pin" size={15} />{listing.location}</div>
        <div className={`meta ${left.urgent ? "urgent" : ""}`}>
          <Icon name="clock" size={15} />
          {left.text} · <LocalTime value={listing.expiresAt} />
        </div>
        <div className="meta">
          <Icon name="user" size={15} />
          {donor?.organizationName || donor?.name}
          {donor?.isVerified && <Icon name="shield" size={14} aria-label="Verified" />}
        </div>

        <div className="card-foot">
          <Link className="btn btn-outline btn-sm btn-block" href={`/food/${listing._id}`}>
            View details <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
