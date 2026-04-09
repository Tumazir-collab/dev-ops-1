"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

/** Basic login form — posts JSON to the Next.js Route Handler. */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Login failed.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="np-form" onSubmit={onSubmit}>
      <h1>Welcome back</h1>
      <p className="np-sub">Enter your email and password to open your notes.</p>
      {error ? <p className="np-error">{error}</p> : null}
      <label className="np-label">
        Email
        <input
          className="np-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="np-label">
        Password
        <input
          className="np-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button className="np-button" type="submit" disabled={loading}>
        {loading ? "Please wait…" : "Log in"}
      </button>
      <p className="np-muted">
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </form>
  );
}
