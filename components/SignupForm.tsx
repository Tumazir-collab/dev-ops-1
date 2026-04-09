"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

/** Basic signup form — creates a user row then starts a session. */
export default function SignupForm() {
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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Signup failed.");
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
      <h1>Create your account</h1>
      <p className="np-sub">We&apos;ll store a secure password hash in Supabase—no OAuth required.</p>
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
        Password (min 6 characters)
        <input
          className="np-input"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      <button className="np-button" type="submit" disabled={loading}>
        {loading ? "Please wait…" : "Create account"}
      </button>
      <p className="np-muted">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
