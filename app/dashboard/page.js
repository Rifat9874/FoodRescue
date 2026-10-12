"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import RequireRole from "@/components/RequireRole";
import StatusBadge from "@/components/StatusBadge";
import LocalTime from "@/components/LocalTime";
import StatCards from "@/components/StatCards";
import Alert from "@/components/Alert";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { Spinner } from "@/components/Loading";
import { useAuth } from "@/components/AuthProvider";

function Dashboard() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const stats = await api("/api/stats/me");
      setCards(stats.cards);
      if (user.role === "DONOR") setListings((await api("/api/food?mine=1")).listings);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => { load(); }, [load]);

  async function remove(id) {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api(`/api/food/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="dash-welcome">
        <div>
          <h1>Welcome, {user.name.split(" ")[0]}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {user.organizationName ? `${user.organizationName} · ` : ""}
            <span className="badge" style={{ verticalAlign: "middle" }}>{user.role}</span>
          </p>
        </div>
        <div className="gap">
          {user.role === "DONOR" && <Link className="btn" href="/donate"><Icon name="plus" size={16} /> New listing</Link>}
          {user.role === "NGO" && <Link className="btn" href="/food"><Icon name="search" size={16} /> Find food</Link>}
          {user.role === "VOLUNTEER" && <Link className="btn" href="/requests"><Icon name="truck" size={16} /> Pickup tasks</Link>}
          {user.role === "ADMIN" && <Link className="btn" href="/admin">Open admin panel</Link>}
        </div>
      </div>

      {!user.isVerified && user.role !== "VOLUNTEER" && user.role !== "ADMIN" && (
        <Alert type="info">Your account is waiting for admin verification.</Alert>
      )}
      {error && <Alert type="error">{error}</Alert>}
      {loading ? <Spinner /> : <StatCards cards={cards} />}

      {user.role === "DONOR" && !loading && (
        <section className="mt">
          <div className="row" style={{ marginBottom: "1rem" }}><h2 style={{ margin: 0 }}>My listings</h2></div>
          {listings.length === 0 ? (
            <EmptyState
              icon="utensils"
              title="You have not posted any food yet"
              action={<Link className="btn" href="/donate">Post your first listing</Link>}
            >
              Share surplus food and verified NGOs nearby can request it.
            </EmptyState>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Food</th><th>Status</th><th>Left</th><th>Until</th><th>Actions</th></tr></thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l._id}>
                      <td><Link href={`/food/${l._id}`}><strong>{l.name}</strong></Link></td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>{l.availableQuantity}/{l.quantity} {l.unit}</td>
                      <td><LocalTime value={l.expiresAt} /></td>
                      <td>
                        <div className="gap">
                          <Link className="btn btn-outline btn-sm" href={`/donate/${l._id}`}>Edit</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => remove(l._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <main className="container page">
      <RequireRole><Dashboard /></RequireRole>
    </main>
  );
}
