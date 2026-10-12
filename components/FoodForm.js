"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { toLocalInput } from "@/lib/format";
import { CATEGORIES, CONDITIONS, UNITS } from "@/lib/constants";
import Alert from "./Alert";
import GalleryPicker from "./GalleryPicker";
import { Spinner } from "./Loading";

const hoursFromNow = (h) => toLocalInput(new Date(Date.now() + h * 3600 * 1000));

// Create form (no listingId) or edit form (with listingId).
export default function FoodForm({ listingId }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", category: CATEGORIES[0], quantity: "", unit: UNITS[0], description: "",
    location: "", availableFrom: hoursFromNow(0), expiresAt: hoursFromNow(4),
    condition: CONDITIONS[0], imageUrl: "",
  });
  const [loading, setLoading] = useState(Boolean(listingId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!listingId) return;
    api(`/api/food/${listingId}`)
      .then(({ listing }) =>
        setForm({
          ...listing,
          quantity: String(listing.quantity),
          availableFrom: toLocalInput(listing.availableFrom),
          expiresAt: toLocalInput(listing.expiresAt),
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        name: form.name, category: form.category, quantity: form.quantity, unit: form.unit,
        description: form.description, location: form.location, condition: form.condition,
        imageUrl: form.imageUrl,
        availableFrom: new Date(form.availableFrom).toISOString(),
        expiresAt: new Date(form.expiresAt).toISOString(),
      };
      await api(listingId ? `/api/food/${listingId}` : "/api/food", {
        method: listingId ? "PUT" : "POST",
        body,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <form className="form form-card form-wide" onSubmit={submit}>
      <div>
        <h1>{listingId ? "Edit listing" : "Donate surplus food"}</h1>
        <p className="muted" style={{ margin: 0 }}>Only share food that is safe to eat. Add an accurate pickup window.</p>
      </div>
      {error && <Alert type="error">{error}</Alert>}

      <div className="field">
        <label htmlFor="name">Food name</label>
        <input id="name" value={form.name} onChange={set("name")} required maxLength={100} />
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="condition">Food condition</label>
          <select id="condition" value={form.condition} onChange={set("condition")}>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="quantity">Quantity (whole number)</label>
          <input id="quantity" type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")} required />
        </div>
        <div className="field">
          <label htmlFor="unit">Unit</label>
          <select id="unit" value={form.unit} onChange={set("unit")}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="location">Pickup location</label>
        <input id="location" value={form.location} onChange={set("location")} required maxLength={200} />
      </div>
      <div className="two-col">
        <div className="field">
          <label htmlFor="availableFrom">Available from</label>
          <input id="availableFrom" type="datetime-local" value={form.availableFrom} onChange={set("availableFrom")} required />
        </div>
        <div className="field">
          <label htmlFor="expiresAt">Available until</label>
          <input id="expiresAt" type="datetime-local" value={form.expiresAt} onChange={set("expiresAt")} required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="description">Description (optional)</label>
        <textarea id="description" rows={3} value={form.description} onChange={set("description")} maxLength={500} />
      </div>
      <div className="field">
        <label>Photo (optional)</label>
        <GalleryPicker
          category={form.category}
          value={form.imageUrl}
          onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
        />
      </div>
      <button className="btn btn-lg" disabled={busy}>
        {busy ? "Saving…" : listingId ? "Save changes" : "Post listing"}
      </button>
    </form>
  );
}
