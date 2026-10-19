"use client";

import Image from "next/image";
import { useState } from "react";
import type { AdminDictionary } from "@/lib/admin/dictionary";
import type { Store } from "@/lib/admin/store";

export function Login({ store, t, onSignedIn }: { store: Store; t: AdminDictionary; onSignedIn: (user: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await store.signIn(email, password);
      onSignedIn((await store.currentUser()) ?? email);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <Image src="/brand/logo.webp" alt="" width={140} height={140} priority />
      {store.mode === "demo" ? (
        <div className="admin-card">
          <h1>{t.login.demoTitle}</h1>
          <p>{t.login.demoText}</p>
          <button className="btn btn--primary" onClick={() => store.signIn("demo", "").then(() => onSignedIn("demo"))}>
            {t.login.enterDemo}
          </button>
        </div>
      ) : (
        <form className="admin-card admin-form" onSubmit={submit}>
          <h1>{t.login.title}</h1>
          <label>
            {t.login.email}
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </label>
          <label>
            {t.login.password}
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
          </label>
          {error && (
            <p className="admin-error" role="alert">
              {t.common.error} {error}
            </p>
          )}
          <button className="btn btn--primary" disabled={busy}>
            {busy ? t.common.loading : t.login.submit}
          </button>
        </form>
      )}
    </div>
  );
}
