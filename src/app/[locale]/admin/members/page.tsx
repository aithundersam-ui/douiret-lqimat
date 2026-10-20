"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import type { Member, StaffRole } from "@/lib/admin/types";

type Form = { id: string | null; name: string; email: string; password: string; role: StaffRole; active: boolean };

const emptyForm: Form = { id: null, name: "", email: "", password: "", role: "staff", active: true };

export default function MembersPage() {
  const { store, t, locale, role } = useAdmin();
  const m = t.members;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [me, setMe] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const reload = useCallback(() => {
    store
      .listMembers()
      .then((res) => {
        setMembers([...res.members]);
        setMe(res.me);
      })
      .catch((err) => setError((err as Error).message));
  }, [store]);

  useEffect(() => {
    if (role === "master") reload();
  }, [role, reload]);

  if (role !== "master") return <p className="admin-hint">{m.onlyMaster}</p>;

  function open(member: Member | null) {
    setForm(member ? { id: member.id, name: member.name, email: member.email, password: "", role: member.role, active: member.active } : emptyForm);
    setFormError("");
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
    setForm(null);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setFormError("");
    try {
      await action();
      close();
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const f = form!;
    run(() =>
      f.id
        ? store.updateMember(f.id, { name: f.name, role: f.role, active: f.active, ...(f.password ? { password: f.password } : {}) })
        : store.createMember({ email: f.email, password: f.password, name: f.name, role: f.role }),
    );
  }

  const isMe = form?.id === me;
  const sorted = members ? [...members].sort((a, b) => (a.role === b.role ? (a.name || a.email).localeCompare(b.name || b.email) : a.role === "master" ? -1 : 1)) : null;
  const when = (iso: string) => new Date(iso).toLocaleDateString(locale === "ar" ? "ar-DZ" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <div className="admin-head">
        <h1>{t.nav.members}</h1>
        <button className="btn btn--primary" onClick={() => open(null)}>
          + {m.add}
        </button>
      </div>
      <p className="admin-hint">{m.intro}</p>

      {error && (
        <p className="admin-error" role="alert">
          {t.common.error} {error}
        </p>
      )}
      {!sorted && !error && <p>{t.common.loading}</p>}

      <ul className="admin-list">
        {sorted?.map((x) => (
          <li key={x.id}>
            <button className={`admin-row${x.active ? "" : " admin-row--muted"}`} onClick={() => open(x)}>
              <span className="admin-row__main">
                <strong>
                  {x.name || x.email}
                  {x.id === me && ` (${m.you})`}
                </strong>
                <span dir="ltr">{x.email}</span>
                <span>{x.lastSignIn ? `${m.lastSignIn}: ${when(x.lastSignIn)}` : m.never}</span>
              </span>
              <span className="admin-row__aside">
                {m.roles[x.role]}
                {!x.active && <small className="admin-warn">{m.blocked}</small>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className="admin-dialog" onClose={() => setForm(null)}>
        {form && (
          <form className="admin-form" onSubmit={submit}>
            <h2>{form.id ? t.common.edit : m.add}</h2>
            <label>
              {m.name}
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              {m.email}
              <input
                type="email"
                dir="ltr"
                required
                disabled={Boolean(form.id)}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              {form.id ? m.newPassword : m.password}
              <input
                type="password"
                dir="ltr"
                autoComplete="new-password"
                minLength={8}
                required={!form.id}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label>
              {m.role}
              <select value={form.role} disabled={isMe} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
                <option value="staff">{m.roles.staff}</option>
                <option value="master">{m.roles.master}</option>
              </select>
              <small className="admin-hint">{m.roleHint}</small>
            </label>
            {form.id && (
              <label className="admin-check">
                <input type="checkbox" checked={form.active} disabled={isMe} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                {m.active}
              </label>
            )}
            {formError && (
              <p className="admin-error" role="alert">
                {t.common.error} {formError}
              </p>
            )}
            <div className="admin-form__actions">
              <button className="btn btn--primary" disabled={busy}>
                {busy ? t.common.saving : t.common.save}
              </button>
              <button type="button" className="btn btn--ghost" onClick={close}>
                {t.common.cancel}
              </button>
              {form.id && !isMe && (
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={busy}
                  onClick={() => confirm(m.confirmDelete) && run(() => store.deleteMember(form.id!))}
                >
                  {t.common.delete}
                </button>
              )}
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
