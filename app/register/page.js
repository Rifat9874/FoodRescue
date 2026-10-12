"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import Alert from "@/components/Alert";
import AuthSide from "@/components/AuthSide";

const ROLES = [
  { value: "DONOR", label: "Donor", hint: "Restaurant, bakery…" },
  { value: "NGO", label: "NGO", hint: "Organization" },
  { value: "VOLUNTEER", label: "Volunteer", hint: "Individual" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "DONOR", organizationName: "", phone: "", address: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/register", { method: "POST", body: form });
      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="auth">
      <AuthSide title="Join the food rescue network" text="Create a free account and start turning surplus food into shared meals." />
      <div className="auth-main">
        <form className="form auth-box" onSubmit={submit}>
          <div>
            <h1>Create your account</h1>
            <p className="muted">It takes less than a minute.</p>
          </div>
          {error && <Alert type="error">{error}</Alert>}
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="field" style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: ".3rem" }}>I am a</legend>
            <div className="role-options">
              {ROLES.map((r) => (
                <label className="role-option" key={r.value}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={set("role")} />
                  <span>{r.label}<small>{r.hint}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" autoComplete="name" required value={form.name} onChange={set("name")} />
          </div>
          {form.role !== "VOLUNTEER" && (
            <div className="field">
              <label htmlFor="org">Organization / business name</label>
              <input id="org" required value={form.organizationName} onChange={set("organizationName")} />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={set("email")} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set("password")} />
            <span className="hint">At least 8 characters, with a letter and a number.</span>
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="phone">Phone (optional)</label>
              <input id="phone" autoComplete="tel" value={form.phone} onChange={set("phone")} />
            </div>
            <div className="field">
              <label htmlFor="address">Address (optional)</label>
              <input id="address" autoComplete="street-address" value={form.address} onChange={set("address")} />
            </div>
          </div>
          {form.role !== "VOLUNTEER" && (
            <Alert type="info">An admin verifies donors and NGOs. NGOs can request food only after they are verified.</Alert>
          )}
          <button className="btn btn-lg" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
          <p className="muted small" style={{ textAlign: "center", margin: 0 }}>Already registered? <Link href="/login">Log in</Link></p>
        </form>
      </div>
    </main>
  );
}
