"use client";

import { useRef, useState } from "react";
import { resizeImage } from "@/lib/admin/image";
import type { NewRow } from "@/lib/admin/store";
import type { TableName, Tables } from "@/lib/admin/types";
import { useAdmin } from "./AdminContext";
import { useRows } from "./useRows";

export type Field<R> = {
  key: keyof R & string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "tel" | "image";
  options?: { value: string; label: string }[];
  required?: boolean;
};

export type Card = { title: React.ReactNode; subtitle?: React.ReactNode; aside?: React.ReactNode; muted?: boolean };

export type Section<R> = { label: string; filter: (row: R) => boolean };

/**
 * A list of records shown as cards, with an add / edit form in a dialog.
 * Used by the Products, Orders, Purchases and Expenses screens.
 */
export function CrudPage<T extends TableName>({
  table,
  title,
  fields,
  emptyRow,
  card,
  sort,
  sections,
  header,
  headingLevel = 1,
}: {
  table: T;
  title: string;
  fields: Field<Tables[T]>[];
  emptyRow: () => NewRow<T>;
  card: (row: Tables[T]) => Card;
  sort?: (a: Tables[T], b: Tables[T]) => number;
  sections?: Section<Tables[T]>[];
  header?: (rows: Tables[T][]) => React.ReactNode;
  headingLevel?: 1 | 2;
}) {
  const { store, t } = useAdmin();
  const { rows, error, reload } = useRows(table);
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<{ id: string | null; values: Record<string, unknown> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function open(row: Tables[T] | null) {
    const { id, ...values } = row ?? { id: null, ...emptyRow() };
    setEditing({ id, values });
    setFormError(null);
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
    setEditing(null);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setFormError(null);
    try {
      await action();
      await reload();
      close();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const values = editing.values as NewRow<T>;
    run(() => (editing.id ? store.update(table, editing.id, values) : store.insert(table, values)));
  }

  const sorted = rows ? [...rows].sort(sort) : null;
  const groups = sorted ? (sections ?? [{ label: "", filter: () => true }]).map((s) => ({ ...s, rows: sorted.filter(s.filter) })) : [];

  return (
    <>
      <div className="admin-head">
        {headingLevel === 1 ? <h1>{title}</h1> : <h2>{title}</h2>}
        <button className="btn btn--primary" onClick={() => open(null)}>
          + {t.common.add}
        </button>
      </div>

      {error && (
        <p className="admin-error" role="alert">
          {t.common.error} {error}
        </p>
      )}
      {!sorted && !error && <p>{t.common.loading}</p>}
      {sorted && header?.(sorted)}
      {sorted?.length === 0 && <p className="admin-empty">{t.common.empty}</p>}

      {groups.map(
        (g) =>
          g.rows.length > 0 && (
            <section key={g.label}>
              {g.label && <h2 className="admin-subhead">{g.label}</h2>}
              <ul className="admin-list">
                {g.rows.map((row) => {
                  const c = card(row);
                  return (
                    <li key={row.id}>
                      <button className={`admin-row${c.muted ? " admin-row--muted" : ""}`} onClick={() => open(row)}>
                        <span className="admin-row__main">
                          <strong>{c.title}</strong>
                          {c.subtitle && <span>{c.subtitle}</span>}
                        </span>
                        {c.aside && <span className="admin-row__aside">{c.aside}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
      )}

      <dialog ref={dialog} className="admin-dialog" onClose={() => setEditing(null)}>
        {editing && (
          <form className="admin-form" onSubmit={submit}>
            <h2>{editing.id ? t.common.edit : t.common.add}</h2>
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={editing.values[f.key]}
                onChange={(v) => setEditing({ ...editing, values: { ...editing.values, [f.key]: v } })}
              />
            ))}
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
              {editing.id && (
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={busy}
                  onClick={() => confirm(t.common.confirmDelete) && run(() => store.remove(table, editing.id!))}
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

function FieldInput<R>({ field, value, onChange }: { field: Field<R>; value: unknown; onChange: (v: unknown) => void }) {
  if (field.type === "image") return <ImageInput label={field.label} value={String(value ?? "")} onChange={onChange} />;
  if (field.type === "checkbox") {
    return (
      <label className="admin-check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        {field.label}
      </label>
    );
  }

  let input: React.ReactNode;
  if (field.type === "select") {
    input = (
      <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (field.type === "textarea") {
    input = <textarea rows={3} required={field.required} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  } else if (field.type === "number") {
    input = (
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        required={field.required}
        value={value === 0 || value ? String(value) : ""}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        dir="ltr"
      />
    );
  } else {
    input = (
      <input
        type={field.type}
        required={field.required}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        dir={field.type === "tel" || field.type === "date" ? "ltr" : undefined}
      />
    );
  }

  return (
    <label>
      {field.label}
      {input}
    </label>
  );
}

/** Photo picker: shrinks the photo, uploads it and keeps its address. */
export function ImageInput({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const { store, t } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await store.uploadImage(await resizeImage(file)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-image">
      <span>{label}</span>
      <div className="admin-image__row">
        <div className="admin-image__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" /> : <span aria-hidden>📷</span>}
        </div>
        <label className="btn btn--ghost">
          {busy ? t.common.saving : value ? t.website.changePhoto : t.website.addPhoto}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        {value && !busy && (
          <button type="button" className="admin-link" onClick={() => onChange("")}>
            {t.website.removePhoto}
          </button>
        )}
      </div>
      {error && (
        <p className="admin-error" role="alert">
          {t.common.error} {error}
        </p>
      )}
    </div>
  );
}
