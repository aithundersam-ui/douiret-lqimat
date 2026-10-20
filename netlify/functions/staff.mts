// Staff accounts, managed by the master admin from the Members screen.
//
// Creating, blocking and deleting logins needs Supabase's secret key, which
// must never reach the browser. It lives only in this Netlify function, read
// from the SUPABASE_SECRET_KEY environment variable set in Netlify.
// Every request must come from a signed-in master admin.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Role = "master" | "staff";

export type Member = {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  lastSignIn: string | null;
};

type Profile = { user_id: string; email: string; name: string; role: Role; active: boolean };

// Blocked accounts are banned in Supabase Auth: they can't sign in or refresh their session.
const BLOCKED = "876000h"; // 100 years

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const fail = (status: number, error: string) => json(status, { error });

export async function handle(req: Request, admin: SupabaseClient): Promise<Response> {
  if (req.method !== "POST") return fail(405, "Use POST.");

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return fail(401, "Sign in first.");
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  if (whoError || !who.user) return fail(401, "Your session has expired. Sign in again.");
  const me = who.user;

  const profiles = await admin.from("staff_profiles").select("*");
  if (profiles.error) return fail(500, profiles.error.message);
  const byId = new Map((profiles.data as Profile[]).map((p) => [p.user_id, p]));
  const activeMasters = () => [...byId.values()].filter((p) => p.role === "master" && p.active);

  // Very first use: if nobody is master yet, the first signed-in staff member to open Members becomes it.
  if (activeMasters().length === 0) {
    const row: Profile = { user_id: me.id, email: me.email ?? "", name: byId.get(me.id)?.name ?? "", role: "master", active: true };
    const { error } = await admin.from("staff_profiles").upsert(row, { onConflict: "user_id" });
    if (error) return fail(500, error.message);
    byId.set(me.id, row);
  }
  const mine = byId.get(me.id);
  if (mine?.role !== "master" || !mine.active) return fail(403, "Only the master admin can manage accounts.");

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = typeof body.id === "string" ? body.id : "";
  const role: Role | undefined = body.role === "master" || body.role === "staff" ? body.role : undefined;
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : undefined;
  const password = typeof body.password === "string" && body.password ? body.password : undefined;
  if (password && password.length < 8) return fail(400, "The password must have at least 8 characters.");

  switch (body.action) {
    case "list": {
      const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
      if (error) return fail(500, error.message);
      const members: Member[] = data.users.map((u) => {
        const p = byId.get(u.id);
        const banned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
        return {
          id: u.id,
          email: u.email ?? "",
          name: p?.name ?? "",
          role: p?.role ?? "staff",
          active: p ? p.active && !banned : !banned,
          lastSignIn: u.last_sign_in_at ?? null,
        };
      });
      return json(200, { members, me: me.id });
    }

    case "create": {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, "Enter a valid email address.");
      if (!password) return fail(400, "Choose a password of at least 8 characters.");
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
      if (error) return fail(400, error.message);
      const row: Profile = { user_id: data.user.id, email, name: name ?? "", role: role ?? "staff", active: true };
      const saved = await admin.from("staff_profiles").upsert(row, { onConflict: "user_id" });
      if (saved.error) return fail(500, saved.error.message);
      return json(200, { id: data.user.id });
    }

    case "update": {
      if (!id) return fail(400, "Missing account.");
      const active = typeof body.active === "boolean" ? body.active : undefined;
      if (id === me.id && (role === "staff" || active === false)) return fail(400, "You can't remove your own master access.");
      const before = byId.get(id);
      const { data: user, error: userError } = await admin.auth.admin.getUserById(id);
      if (userError || !user.user) return fail(404, "This account doesn't exist anymore.");
      const authChanges: { password?: string; ban_duration?: string } = {};
      if (password) authChanges.password = password;
      if (active !== undefined) authChanges.ban_duration = active ? "none" : BLOCKED;
      if (Object.keys(authChanges).length) {
        const { error } = await admin.auth.admin.updateUserById(id, authChanges);
        if (error) return fail(400, error.message);
      }
      const row: Profile = {
        user_id: id,
        email: user.user.email ?? before?.email ?? "",
        name: name ?? before?.name ?? "",
        role: role ?? before?.role ?? "staff",
        active: active ?? before?.active ?? true,
      };
      const saved = await admin.from("staff_profiles").upsert(row, { onConflict: "user_id" });
      if (saved.error) return fail(500, saved.error.message);
      return json(200, { ok: true });
    }

    case "delete": {
      if (!id) return fail(400, "Missing account.");
      if (id === me.id) return fail(400, "You can't delete your own account.");
      const { error } = await admin.auth.admin.deleteUser(id);
      if (error) return fail(400, error.message);
      await admin.from("staff_profiles").delete().eq("user_id", id);
      return json(200, { ok: true });
    }

    default:
      return fail(400, "Unknown action.");
  }
}

export default async (req: Request) => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return fail(500, "The SUPABASE_SECRET_KEY setting is missing on Netlify.");
  return handle(req, createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }));
};
