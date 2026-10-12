"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { ALL_ROLES, FOOD_STATUS } from "@/lib/constants";
import RequireRole from "@/components/RequireRole";
import RequestList from "@/components/RequestList";
import StatusBadge from "@/components/StatusBadge";
import LocalTime from "@/components/LocalTime";
import StatCards from "@/components/StatCards";
import Alert from "@/components/Alert";
import EmptyState from "@/components/EmptyState";
import { Spinner } from "@/components/Loading";

function Overview() {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/api/stats/me").then((d) => setCards(d.cards)).catch((e) => setError(e.message));
  }, []);
  return (
    <>
      {error && <Alert type="error">{error}</Alert>}
      <StatCards cards={cards} />
    </>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (role) params.set("role", role);
      if (q) params.set("q", q);
      setUsers((await api(`/api/admin/users?${params}`)).users);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [role, q]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  async function update(id, changes) {
    try {
      await api(`/api/admin/users/${id}`, { method: "PATCH", body: changes });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="filters">
        <input aria-label="Search users" placeholder="Search name, email, organization" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {ALL_ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {loading && <Spinner />}
      {!loading && users.length === 0 && <EmptyState icon="users" title="No users found">Try a different search or role.</EmptyState>}
      {users.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organization</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td><td>{u.email}</td><td><span className="badge">{u.role}</span></td><td>{u.organizationName || "-"}</td>
                  <td>{u.isVerified ? <span className="badge badge-green">VERIFIED</span> : <span className="badge badge-yellow">NO</span>}</td>
                  <td>{u.isSuspended ? <span className="badge badge-red">SUSPENDED</span> : <span className="badge badge-green">ACTIVE</span>}</td>
                  <td><div className="gap">
                    {u.role !== "ADMIN" && (
                      <>
                        <button className="btn btn-outline btn-sm" onClick={() => update(u._id, { isVerified: !u.isVerified })}>{u.isVerified ? "Unverify" : "Verify"}</button>
                        <button className={`btn btn-sm ${u.isSuspended ? "" : "btn-danger"}`} onClick={() => update(u._id, { isSuspended: !u.isSuspended })}>{u.isSuspended ? "Reactivate" : "Suspend"}</button>
                      </>
                    )}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Listings() {
  const [listings, setListings] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ all: "1" });
      if (status) params.set("status", status);
      setListings((await api(`/api/food?${params}`)).listings);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => { load(); }, [load]);

  async function act(id, action) {
    if (action === "suspend" && !window.confirm("Suspend this listing? Pending requests will be rejected.")) return;
    try {
      await api(`/api/admin/food/${id}`, { method: "PATCH", body: { action } });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="field" style={{ maxWidth: 240 }}>
        <label htmlFor="adminStatus">Status</label>
        <select id="adminStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {FOOD_STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {loading && <Spinner />}
      {!loading && listings.length === 0 && <EmptyState icon="utensils" title="No listings found">Try a different status filter.</EmptyState>}
      {listings.length > 0 && (
        <div className="table-wrap" style={{ marginTop: "1rem" }}>
          <table>
            <thead><tr><th>Food</th><th>Donor</th><th>Status</th><th>Left</th><th>Until</th><th>Actions</th></tr></thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id}>
                  <td><Link href={`/food/${l._id}`}><strong>{l.name}</strong></Link></td>
                  <td>{l.donor?.organizationName || l.donor?.name}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td>{l.availableQuantity}/{l.quantity} {l.unit}</td>
                  <td><LocalTime value={l.expiresAt} /></td>
                  <td>
                    {l.status === "CANCELLED"
                      ? <button className="btn btn-outline btn-sm" onClick={() => act(l._id, "restore")}>Restore</button>
                      : <button className="btn btn-danger btn-sm" onClick={() => act(l._id, "suspend")}>Suspend</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

const TABS = { Overview, Users, Listings, Requests: RequestList };

function AdminPanel() {
  const [tab, setTab] = useState("Overview");
  const Active = TABS[tab];
  return (
    <>
      <div className="page-header"><h1>Admin panel</h1><p>Manage users, listings and pickups across the platform.</p></div>
      <div className="tabs" role="tablist">
        {Object.keys(TABS).map((name) => (
          <button key={name} role="tab" aria-selected={tab === name} className="tab" onClick={() => setTab(name)}>{name}</button>
        ))}
      </div>
      <Active />
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="container page"><RequireRole roles={["ADMIN"]}><AdminPanel /></RequireRole></main>
  );
}
