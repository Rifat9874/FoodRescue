"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import RequireRole from "@/components/RequireRole";
import LocalTime from "@/components/LocalTime";
import Alert from "@/components/Alert";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { Spinner } from "@/components/Loading";

function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setItems((await api("/api/notifications")).notifications);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function markAllRead() {
    try {
      await api("/api/notifications", { method: "PATCH", body: {} });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const hasUnread = items.some((n) => !n.read);

  return (
    <>
      <div className="row page-header">
        <h1 style={{ margin: 0 }}>Notifications</h1>
        {hasUnread && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>
            <Icon name="check" size={14} /> Mark all as read
          </button>
        )}
      </div>
      {error && <Alert type="error">{error}</Alert>}
      {loading && <Spinner />}
      {!loading && items.length === 0 && (
        <EmptyState icon="bell" title="You are all caught up">
          You have no notifications yet. We will let you know when something happens.
        </EmptyState>
      )}
      <div className="notice-list">
        {items.map((n) => (
          <div key={n._id} className={`card notice ${n.read ? "" : "unread"}`}>
            <div className="stat-icon"><Icon name="bell" size={18} /></div>
            <div>
              <Link href={n.link}>{n.message}</Link>
              <div className="muted small"><LocalTime value={n.createdAt} /></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function NotificationsPage() {
  return (
    <main className="container page"><RequireRole><Notifications /></RequireRole></main>
  );
}
