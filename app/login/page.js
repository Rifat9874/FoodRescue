"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import Alert from "@/components/Alert";
import AuthSide from "@/components/AuthSide";
import DemoAccounts from "@/components/DemoAccounts";
import { DEMO_PASSWORD } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(credentials) {
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/login", { method: "POST", body: credentials });
      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const submit = (e) => {
    e.preventDefault();
    login(form);
  };

  // Demo cards sign in straight away, with the password shown in the form for transparency.
  const loginAsDemo = (account) => {
    const credentials = { email: account.email, password: DEMO_PASSWORD };
    setForm(credentials);
    login(credentials);
  };

  return (
    <main className="auth">
      <AuthSide title="Welcome back" text="Log in to manage your listings, requests and pickups." />
      <div className="auth-main">
        <form className="form auth-box" onSubmit={submit}>
          <div>
            <h1>Log in</h1>
            <p className="muted">Enter your details to continue.</p>
          </div>
          {error && <Alert type="error">{error}</Alert>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button className="btn btn-lg" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
          <p className="muted small" style={{ textAlign: "center", margin: 0 }}>New here? <Link href="/register">Create an account</Link></p>
        </form>
        <div className="auth-box" style={{ marginTop: "1.75rem" }}>
          <DemoAccounts onSelect={loginAsDemo} disabled={busy} />
        </div>
      </div>
    </main>
  );
}
