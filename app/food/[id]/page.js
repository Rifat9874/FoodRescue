"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/client";
import { toLocalInput, timeLeft } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";
import StatusBadge from "@/components/StatusBadge";
import LocalTime from "@/components/LocalTime";
import Alert from "@/components/Alert";
import Icon from "@/components/Icon";
import { Spinner } from "@/components/Loading";

function Info({ icon, label, children }) {
  return (
    <li>
      <div className="stat-icon"><Icon name={icon} size={18} /></div>
      <div><small>{label}</small>{children}</div>
    </li>
  );
}

export default function FoodDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ quantity: "", preferredTime: toLocalInput(Date.now() + 3600 * 1000), message: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/food/${id}`)
      .then((data) => setListing(data.listing))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError("");
    try {
      await api("/api/requests", {
        method: "POST",
        body: { listingId: id, quantity: form.quantity, message: form.message, preferredTime: new Date(form.preferredTime).toISOString() },
      });
      setSuccess("Pickup request sent. The donor will be notified.");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className="container page"><Spinner /></main>;
  if (error) {
    return (
      <main className="container page">
        <Alert type="error">{error}</Alert>
        <Link className="back-link" href="/food"><Icon name="arrowLeft" size={16} /> Back to listings</Link>
      </main>
    );
  }

  const expired = new Date(listing.expiresAt) <= new Date();
  const requestable = listing.status === "AVAILABLE" && !expired && listing.availableQuantity > 0;
  const isOwner = user && String(listing.donor?._id) === user.id;
  const left = timeLeft(listing.expiresAt);
  const donorName = listing.donor?.organizationName || listing.donor?.name;

  return (
    <main className="container page">
      <Link className="back-link" href="/food"><Icon name="arrowLeft" size={16} /> Back to listings</Link>
      <div className="detail">
        <div className="card">
          <div className="detail-media">
            {listing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="food-img" src={listing.imageUrl} alt={listing.name} />
            ) : (
              <div className="food-placeholder"><Icon name="utensils" size={72} strokeWidth={1.25} /></div>
            )}
          </div>
          <div className="card-body" style={{ padding: "1.75rem" }}>
            <div className="row" style={{ alignItems: "flex-start" }}>
              <div>
                <span className="tag">{listing.category}</span>
                <h1 style={{ marginTop: ".5rem" }}>{listing.name}</h1>
              </div>
              <StatusBadge status={expired && listing.status === "AVAILABLE" ? "EXPIRED" : listing.status} />
            </div>
            {listing.description && <p style={{ fontSize: "1.05rem" }}>{listing.description}</p>}
            <ul className="info-list">
              <Info icon="box" label="Quantity left">
                <strong>{listing.availableQuantity} of {listing.quantity} {listing.unit}</strong>
              </Info>
              <Info icon="tag" label="Condition">{listing.condition}</Info>
              <Info icon="pin" label="Pickup location">{listing.location}</Info>
              <Info icon="clock" label="Availability">
                <span className={left.urgent ? "urgent" : ""}>{left.text}.</span>{" "}
                <span className="muted"><LocalTime value={listing.availableFrom} /> → <LocalTime value={listing.expiresAt} /></span>
              </Info>
              <Info icon="user" label="Donor">
                {donorName}{listing.donor?.isVerified && <> <span className="badge badge-green">VERIFIED</span></>}
              </Info>
            </ul>
            {isOwner && (
              <div style={{ marginTop: "1.5rem" }}>
                <Link className="btn btn-outline btn-sm" href={`/donate/${listing._id}`}><Icon name="edit" size={14} /> Edit listing</Link>
              </div>
            )}
          </div>
        </div>

        <aside className="card sticky-card">
          <div className="card-body" style={{ padding: "1.5rem" }}>
            {!requestable && <Alert type="info">This food can no longer be requested.</Alert>}
            {requestable && !user && (
              <>
                <h2>Request this food</h2>
                <p className="muted">Log in with a verified NGO account to request a pickup.</p>
                <Link className="btn btn-block" href="/login">Log in</Link>
                <p className="small muted" style={{ marginTop: ".75rem", textAlign: "center" }}>
                  No account? <Link href="/register">Sign up free</Link>
                </p>
              </>
            )}
            {requestable && user && user.role !== "NGO" && (
              <>
                <h2>Request this food</h2>
                <p className="muted">Only NGOs can request pickups. Volunteers can take approved pickups from the Pickup tasks page.</p>
              </>
            )}
            {requestable && user?.role === "NGO" && !user.isVerified && (
              <Alert type="info">Your organization is waiting for admin verification. You can request food once it is verified.</Alert>
            )}
            {requestable && user?.role === "NGO" && user.isVerified && (
              success ? (
                <Alert type="success">{success} <Link href="/requests">Track your requests</Link></Alert>
              ) : (
                <form className="form" onSubmit={submit}>
                  <h2>Request pickup</h2>
                  {formError && <Alert type="error">{formError}</Alert>}
                  <div className="field">
                    <label htmlFor="qty">Quantity ({listing.unit})</label>
                    <input id="qty" type="number" min="1" step="1" max={listing.availableQuantity} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                    <span className="hint">Maximum {listing.availableQuantity}</span>
                  </div>
                  <div className="field">
                    <label htmlFor="time">Preferred pickup time</label>
                    <input id="time" type="datetime-local" required value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
                  </div>
                  <div className="field">
                    <label htmlFor="msg">Message (optional)</label>
                    <textarea id="msg" rows={3} maxLength={500} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button className="btn btn-block" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
                </form>
              )
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
