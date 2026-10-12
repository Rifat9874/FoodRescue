"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";
import { REQUEST_STATUS } from "@/lib/constants";
import StatusBadge from "./StatusBadge";
import Alert from "./Alert";
import EmptyState from "./EmptyState";
import Icon from "./Icon";
import { Spinner } from "./Loading";
import LocalTime from "./LocalTime";

const LABELS = {
  approve: "Approve", reject: "Reject", claim: "Take this pickup", start: "Start pickup",
  pickup: "Mark picked up", complete: "Confirm completed", cancel: "Cancel request",
};
const CONFIRM = { reject: "Reject this request?", cancel: "Cancel this request?" };
const DANGER = ["reject", "cancel"];

// Shows pickup requests for the logged-in role. Buttons come from the server's `actions` list.
export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`/api/requests${status ? `?status=${status}` : ""}`);
      setRequests(data.requests);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function act(id, action) {
    if (CONFIRM[action] && !window.confirm(CONFIRM[action])) return;
    try {
      await api(`/api/requests/${id}`, { method: "PATCH", body: { action } });
      setNotice("Request updated.");
      setError("");
      await load();
    } catch (e) {
      setError(e.message);
      setNotice("");
    }
  }

  async function toggleHistory(id) {
    if (history[id]) return setHistory((h) => ({ ...h, [id]: null }));
    try {
      const data = await api(`/api/requests/${id}`);
      setHistory((h) => ({ ...h, [id]: data.history }));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <div className="field" style={{ maxWidth: 260 }}>
        <label htmlFor="statusFilter">Filter by status</label>
        <select id="statusFilter" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {REQUEST_STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {notice && <Alert type="success">{notice}</Alert>}
      {loading && requests.length === 0 && <Spinner />}
      {!loading && requests.length === 0 && !error && (
        <EmptyState icon="inbox" title="No pickup requests yet">
          {status ? "No requests have this status." : "Requests will show up here as soon as they are created."}
        </EmptyState>
      )}

      <div className="request-grid" style={{ marginTop: "1rem" }}>
        {requests.map((r) => (
          <article className="card card-hover" key={r._id}>
            <div className="card-body">
              <div className="row">
                <h3><Link href={`/food/${r.listing?._id}`}>{r.listing?.name || "Listing"}</Link></h3>
                <StatusBadge status={r.status} />
              </div>
              <p><strong>{r.quantity} {r.unit}</strong></p>
              <p className="meta"><Icon name="heart" size={14} />NGO: {r.requester?.organizationName || r.requester?.name} {r.requester?.phone ? `(${r.requester.phone})` : ""}</p>
              <p className="meta"><Icon name="user" size={14} />Donor: {r.donor?.organizationName || r.donor?.name} {r.donor?.phone ? `(${r.donor.phone})` : ""}</p>
              {r.volunteer && <p className="meta"><Icon name="truck" size={14} />Volunteer: {r.volunteer.name}</p>}
              <p className="meta"><Icon name="pin" size={14} />Pickup: {r.listing?.location}</p>
              <p className="meta"><Icon name="clock" size={14} />Preferred time: <LocalTime value={r.preferredTime} /></p>
              {r.message && <p className="small">“{r.message}”</p>}

              <div className="gap" style={{ marginTop: ".9rem" }}>
                {r.actions.map((a) => (
                  <button key={a} className={`btn btn-sm ${DANGER.includes(a) ? "btn-danger" : ""}`} onClick={() => act(r._id, a)}>
                    {LABELS[a]}
                  </button>
                ))}
                <button className="btn btn-outline btn-sm" onClick={() => toggleHistory(r._id)}>
                  {history[r._id] ? "Hide history" : "History"}
                </button>
              </div>

              {history[r._id] && (
                <ul className="history">
                  {history[r._id].map((h) => (
                    <li key={h._id}>
                      {h.action}: {h.toStatus.replaceAll("_", " ")} by {h.actor?.name} (<LocalTime value={h.createdAt} />)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
