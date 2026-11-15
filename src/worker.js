// Family Meals: Cloudflare Worker API + static assets.
// Data lives in a D1 (SQLite) database bound as env.DB. Tables are created on first use.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, email TEXT, is_cook INTEGER NOT NULL DEFAULT 0, pos INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, role TEXT NOT NULL, member_id TEXT, created INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS ratings (member_id TEXT NOT NULL, recipe_id TEXT NOT NULL, stars INTEGER NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY (member_id, recipe_id))`,
  `CREATE TABLE IF NOT EXISTS votes (member_id TEXT NOT NULL, week TEXT NOT NULL, recipe_id TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY (member_id, week, recipe_id))`,
  `CREATE TABLE IF NOT EXISTS cook_log (id TEXT PRIMARY KEY, recipe_id TEXT NOT NULL, d TEXT NOT NULL, created INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS plans (week TEXT NOT NULL, recipe_id TEXT NOT NULL, pos INTEGER NOT NULL, PRIMARY KEY (week, recipe_id))`,
  `CREATE TABLE IF NOT EXISTS shopping (week TEXT PRIMARY KEY, data TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS attempts (k TEXT PRIMARY KEY, n INTEGER NOT NULL, since INTEGER NOT NULL)`,
];
const COLORS = ["#DB3F27", "#2341C4", "#1D8256", "#B86A00", "#77479C", "#16858A", "#BC4C86", "#8A5A2B", "#4A9433", "#B23A2B"];
const WEEK = /^\d{4}-\d{2}-\d{2}$/;
const RID = /^[a-z0-9-]{1,80}$/;
const MAX_VOTES = 7;

let ready = null;
// Columns added after the first release. Each runs once; "duplicate column" means it's already there.
const UPGRADES = [`ALTER TABLE votes ADD COLUMN note TEXT`];
async function migrate(env) {
  await env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)));
  for (const sql of UPGRADES) {
    try { await env.DB.prepare(sql).run(); }
    catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; }
  }
}
function ensureSchema(env) {
  if (!ready) ready = migrate(env).catch((e) => { ready = null; throw e; });
  return ready;
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const fail = (status, error) => json({ error }, status);
const now = () => Date.now();
const rand = (bytes = 24) => {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...a)).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]);
};
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function hashSecret(secret, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return b64(bits);
}
async function checkSecret(env, name, secret) {
  const row = await env.DB.prepare("SELECT v FROM settings WHERE k = ?").bind(name).first();
  if (!row) return false;
  const { salt, hash } = JSON.parse(row.v);
  const got = await hashSecret(String(secret || "").trim().toLowerCase(), salt);
  return got === hash;
}
async function setSecret(env, name, secret) {
  const salt = rand(16);
  const hash = await hashSecret(String(secret).trim().toLowerCase(), salt);
  await env.DB.prepare("INSERT INTO settings (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(name, JSON.stringify({ salt, hash })).run();
}
async function getSetting(env, k) {
  const r = await env.DB.prepare("SELECT v FROM settings WHERE k = ?").bind(k).first();
  return r ? r.v : null;
}

// Slow down guessing: 8 wrong tries per 15 minutes per client IP.
async function throttle(env, req, kind) {
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const k = kind + ":" + ip;
  const r = await env.DB.prepare("SELECT n, since FROM attempts WHERE k = ?").bind(k).first();
  if (r && now() - r.since < 15 * 60e3 && r.n >= 8) return true;
  return false;
}
async function noteFailure(env, req, kind) {
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const k = kind + ":" + ip;
  const r = await env.DB.prepare("SELECT n, since FROM attempts WHERE k = ?").bind(k).first();
  if (!r || now() - r.since >= 15 * 60e3) await env.DB.prepare("INSERT OR REPLACE INTO attempts (k, n, since) VALUES (?, 1, ?)").bind(k, now()).run();
  else await env.DB.prepare("UPDATE attempts SET n = n + 1 WHERE k = ?").bind(k).run();
}

async function newSession(env, role, memberId = null) {
  const token = rand(32);
  await env.DB.prepare("INSERT INTO sessions (token, role, member_id, created) VALUES (?, ?, ?, ?)").bind(token, role, memberId, now()).run();
  return token;
}
async function session(env, req) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  return env.DB.prepare("SELECT token, role, member_id FROM sessions WHERE token = ?").bind(token).first();
}

// ---------- Google sign-in (ID token verification) ----------
let jwksCache = null;
async function googleKeys() {
  if (jwksCache && jwksCache.exp > now()) return jwksCache.keys;
  const res = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  const body = await res.json();
  const maxAge = Number((res.headers.get("cache-control") || "").match(/max-age=(\d+)/)?.[1] || 3600);
  jwksCache = { keys: body.keys, exp: now() + maxAge * 1000 };
  return body.keys;
}
const b64urlDecode = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));
async function verifyGoogle(idToken, clientId) {
  const parts = String(idToken || "").split(".");
  if (parts.length !== 3) return null;
  const header = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])));
  const jwk = (await googleKeys()).find((k) => k.kid === header.kid);
  if (!jwk || header.alg !== "RS256") return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlDecode(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  if (!ok) return null;
  if (payload.aud !== clientId) return null;
  if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)) return null;
  if (payload.exp * 1000 < now()) return null;
  if (!payload.email || payload.email_verified === false) return null;
  return payload;
}

// ---------- State ----------
async function state(env, week) {
  const [members, ratings, votes, log, plan, shop, gid] = await Promise.all([
    env.DB.prepare("SELECT id, name, color, email, is_cook FROM members ORDER BY pos, created").all(),
    env.DB.prepare("SELECT member_id, recipe_id, stars FROM ratings").all(),
    env.DB.prepare("SELECT member_id, week, recipe_id, note FROM votes WHERE week = ?").bind(week).all(),
    env.DB.prepare("SELECT id, recipe_id, d FROM cook_log ORDER BY d DESC, created DESC").all(),
    env.DB.prepare("SELECT recipe_id FROM plans WHERE week = ? ORDER BY pos").bind(week).all(),
    env.DB.prepare("SELECT data FROM shopping WHERE week = ?").bind(week).first(),
    getSetting(env, "google_client_id"),
  ]);
  return {
    week,
    members: members.results.map((m) => ({ id: m.id, name: m.name, color: m.color, email: m.email || "", cook: !!m.is_cook })),
    ratings: ratings.results.map((r) => [r.member_id, r.recipe_id, r.stars]),
    votes: votes.results.map((v) => [v.member_id, v.recipe_id, v.note || ""]),
    log: log.results.map((e) => ({ id: e.id, r: e.recipe_id, d: e.d })),
    plan: plan.results.map((p) => p.recipe_id),
    shop: shop ? JSON.parse(shop.data) : { got: {}, extras: [] },
    googleClientId: gid || "",
  };
}

// A session tied to one person (Google or cook PIN) may only act as that person.
// A family-code session may act as anyone except the cook.
async function memberOk(env, id, s) {
  const mem = await env.DB.prepare("SELECT id, is_cook FROM members WHERE id = ?").bind(String(id || "")).first();
  if (!mem) return false;
  if (s.member_id) return s.member_id === mem.id;
  return !mem.is_cook;
}

// ---------- Router ----------
async function api(req, env, url) {
  await ensureSchema(env);
  const p = url.pathname.replace(/^\/api/, "");
  const m = req.method;
  const body = m === "POST" ? await req.json().catch(() => ({})) : {};
  const isSetup = !!(await getSetting(env, "family_code"));

  if (p === "/status" && m === "GET") {
    return json({ setup: isSetup, googleClientId: isSetup ? (await getSetting(env, "google_client_id")) || "" : "" });
  }

  if (p === "/setup" && m === "POST") {
    if (isSetup) return fail(409, "This family table is already set up.");
    const code = String(body.familyCode || "").trim(), pin = String(body.cookPin || "").trim();
    const cookName = String(body.cookName || "").trim().slice(0, 40);
    const names = (Array.isArray(body.members) ? body.members : []).map((n) => String(n).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
    if (code.length < 4) return fail(400, "Make the family code at least 4 characters.");
    if (!/^\d{4,8}$/.test(pin)) return fail(400, "The cook PIN should be 4 to 8 digits.");
    if (!cookName) return fail(400, "Add the cook's name.");
    await setSecret(env, "family_code", code);
    await setSecret(env, "cook_pin", pin);
    const cookId = rand(9);
    const stmts = [env.DB.prepare("INSERT INTO members (id, name, color, email, is_cook, pos, created) VALUES (?, ?, ?, ?, 1, 0, ?)").bind(cookId, cookName, COLORS[0], String(body.cookEmail || "").trim().toLowerCase() || null, now())];
    names.forEach((n, i) => stmts.push(env.DB.prepare("INSERT INTO members (id, name, color, is_cook, pos, created) VALUES (?, ?, ?, 0, ?, ?)").bind(rand(9), n, COLORS[(i + 1) % COLORS.length], i + 1, now())));
    await env.DB.batch(stmts);
    return json({ token: await newSession(env, "cook", cookId), memberId: cookId });
  }

  if (!isSetup) return fail(428, "Set up the family table first.");

  if (p === "/login" && m === "POST") {
    if (await throttle(env, req, "code")) return fail(429, "Too many wrong tries. Wait 15 minutes and try again.");
    if (!(await checkSecret(env, "family_code", body.code))) { await noteFailure(env, req, "code"); return fail(401, "That family code isn't right."); }
    return json({ token: await newSession(env, "family") });
  }

  if (p === "/google" && m === "POST") {
    const clientId = await getSetting(env, "google_client_id");
    if (!clientId) return fail(400, "Google sign-in isn't turned on yet.");
    const claims = await verifyGoogle(body.credential, clientId).catch(() => null);
    if (!claims) return fail(401, "Google sign-in didn't go through. Try again.");
    const email = claims.email.toLowerCase();
    const mem = await env.DB.prepare("SELECT id, is_cook FROM members WHERE lower(email) = ?").bind(email).first();
    if (!mem) return fail(403, `${email} isn't on the family list. Ask the cook to add it to your name under Family settings.`);
    return json({ token: await newSession(env, mem.is_cook ? "cook" : "family", mem.id), memberId: mem.id });
  }

  const s = await session(env, req);
  if (!s) return fail(401, "Sign in again.");
  const cook = s.role === "cook";

  if (p === "/logout" && m === "POST") { await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(s.token).run(); return json({ ok: true }); }

  if (p === "/state" && m === "GET") {
    const week = url.searchParams.get("week") || "";
    if (!WEEK.test(week)) return fail(400, "Bad week.");
    return json({ ...(await state(env, week)), role: s.role, sessionMember: s.member_id });
  }

  if (p === "/cook" && m === "POST") {
    if (await throttle(env, req, "pin")) return fail(429, "Too many wrong tries. Wait 15 minutes and try again.");
    if (!(await checkSecret(env, "cook_pin", body.pin))) { await noteFailure(env, req, "pin"); return fail(401, "That PIN isn't right."); }
    const c = await env.DB.prepare("SELECT id FROM members WHERE is_cook = 1 ORDER BY pos LIMIT 1").first();
    await env.DB.prepare("UPDATE sessions SET role = 'cook', member_id = ? WHERE token = ?").bind(c ? c.id : null, s.token).run();
    return json({ ok: true, memberId: c ? c.id : null });
  }
  if (p === "/uncook" && m === "POST") {
    await env.DB.prepare("UPDATE sessions SET role = 'family', member_id = NULL WHERE token = ?").bind(s.token).run();
    return json({ ok: true });
  }

  if (p === "/rate" && m === "POST") {
    const { member, recipe } = body, stars = Number(body.stars);
    if (!RID.test(recipe || "") || !(await memberOk(env, member, s))) return fail(403, "You can only rate as yourself.");
    if (stars >= 1 && stars <= 5) await env.DB.prepare("INSERT INTO ratings (member_id, recipe_id, stars, updated) VALUES (?, ?, ?, ?) ON CONFLICT(member_id, recipe_id) DO UPDATE SET stars = excluded.stars, updated = excluded.updated").bind(member, recipe, stars, now()).run();
    else await env.DB.prepare("DELETE FROM ratings WHERE member_id = ? AND recipe_id = ?").bind(member, recipe).run();
    return json({ ok: true });
  }

  if (p === "/vote" && m === "POST") {
    const { member, recipe, week, on } = body;
    if (!RID.test(recipe || "") || !WEEK.test(week || "") || !(await memberOk(env, member, s))) return fail(403, "You can only vote as yourself.");
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : null;
    if (on) {
      const had = await env.DB.prepare("SELECT 1 AS x FROM votes WHERE member_id = ? AND week = ? AND recipe_id = ?").bind(member, week, recipe).first();
      if (!had) {
        const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM votes WHERE member_id = ? AND week = ?").bind(member, week).first();
        if (n.n >= MAX_VOTES) return fail(409, `You've used all ${MAX_VOTES} votes. Remove one first.`);
        await env.DB.prepare("INSERT INTO votes (member_id, week, recipe_id, created, note) VALUES (?, ?, ?, ?, ?)").bind(member, week, recipe, now(), note || null).run();
      } else if (note !== null) {
        await env.DB.prepare("UPDATE votes SET note = ? WHERE member_id = ? AND week = ? AND recipe_id = ?").bind(note || null, member, week, recipe).run();
      }
    } else await env.DB.prepare("DELETE FROM votes WHERE member_id = ? AND week = ? AND recipe_id = ?").bind(member, week, recipe).run();
    return json({ ok: true });
  }

  if (p === "/shop" && m === "POST") {
    const { week } = body;
    if (!WEEK.test(week || "")) return fail(400, "Bad week.");
    const got = {}, extras = [];
    for (const [k, v] of Object.entries(body.got || {})) if (v && k.length < 120) got[k] = true;
    for (const x of body.extras || []) if (typeof x === "string" && x.trim() && extras.length < 100) extras.push(x.trim().slice(0, 80));
    await env.DB.prepare("INSERT INTO shopping (week, data) VALUES (?, ?) ON CONFLICT(week) DO UPDATE SET data = excluded.data").bind(week, JSON.stringify({ got, extras })).run();
    return json({ ok: true });
  }

  // ----- Cook only below -----
  if (!cook) return fail(403, "Only the cook can do that.");

  if (p === "/log" && m === "POST") {
    if (!RID.test(body.recipe || "") || !WEEK.test(body.d || "")) return fail(400, "Bad entry.");
    const id = rand(8);
    await env.DB.prepare("INSERT INTO cook_log (id, recipe_id, d, created) VALUES (?, ?, ?, ?)").bind(id, body.recipe, body.d, now()).run();
    return json({ ok: true, id });
  }
  if (p === "/log/delete" && m === "POST") {
    await env.DB.prepare("DELETE FROM cook_log WHERE id = ?").bind(String(body.id || "")).run();
    return json({ ok: true });
  }
  if (p === "/plan" && m === "POST") {
    const { week, meals } = body;
    if (!WEEK.test(week || "") || !Array.isArray(meals) || meals.some((r) => !RID.test(r))) return fail(400, "Bad menu.");
    const stmts = [env.DB.prepare("DELETE FROM plans WHERE week = ?").bind(week)];
    meals.slice(0, 30).forEach((r, i) => stmts.push(env.DB.prepare("INSERT OR IGNORE INTO plans (week, recipe_id, pos) VALUES (?, ?, ?)").bind(week, r, i)));
    await env.DB.batch(stmts);
    return json({ ok: true });
  }
  if (p === "/members" && m === "POST") {
    const name = String(body.name || "").trim().slice(0, 40);
    const email = String(body.email || "").trim().toLowerCase();
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(400, "That email doesn't look right.");
    if (email) {
      const dupe = await env.DB.prepare("SELECT id FROM members WHERE lower(email) = ? AND id != ?").bind(email, String(body.id || "")).first();
      if (dupe) return fail(409, "Someone else already has that email.");
    }
    if (body.id) {
      if (!name) return fail(400, "Names can't be empty.");
      await env.DB.prepare("UPDATE members SET name = ?, email = ? WHERE id = ?").bind(name, email || null, body.id).run();
      return json({ ok: true });
    }
    if (!name) return fail(400, "Add a name.");
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM members").first();
    if (n.n >= 20) return fail(400, "That's the limit of 20 people.");
    await env.DB.prepare("INSERT INTO members (id, name, color, email, is_cook, pos, created) VALUES (?, ?, ?, ?, 0, ?, ?)").bind(rand(9), name, COLORS[n.n % COLORS.length], email || null, n.n, now()).run();
    return json({ ok: true });
  }
  if (p === "/members/delete" && m === "POST") {
    const mem = await env.DB.prepare("SELECT is_cook FROM members WHERE id = ?").bind(String(body.id || "")).first();
    if (!mem) return fail(404, "Not found.");
    if (mem.is_cook) return fail(400, "The cook can't be removed.");
    await env.DB.batch([
      env.DB.prepare("DELETE FROM members WHERE id = ?").bind(body.id),
      env.DB.prepare("DELETE FROM ratings WHERE member_id = ?").bind(body.id),
      env.DB.prepare("DELETE FROM votes WHERE member_id = ?").bind(body.id),
      env.DB.prepare("DELETE FROM sessions WHERE member_id = ?").bind(body.id),
    ]);
    return json({ ok: true });
  }
  if (p === "/settings" && m === "POST") {
    if (body.familyCode !== undefined) {
      const c = String(body.familyCode).trim();
      if (c.length < 4) return fail(400, "Make the family code at least 4 characters.");
      await setSecret(env, "family_code", c);
    }
    if (body.cookPin !== undefined) {
      if (!/^\d{4,8}$/.test(String(body.cookPin).trim())) return fail(400, "The cook PIN should be 4 to 8 digits.");
      await setSecret(env, "cook_pin", body.cookPin);
    }
    if (body.googleClientId !== undefined) {
      const g = String(body.googleClientId).trim();
      if (g && !/^[\w.-]+\.apps\.googleusercontent\.com$/.test(g)) return fail(400, "A Google client ID ends in .apps.googleusercontent.com");
      await env.DB.prepare("INSERT INTO settings (k, v) VALUES ('google_client_id', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(g).run();
    }
    return json({ ok: true });
  }

  return fail(404, "Not found.");
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      try { return await api(req, env, url); }
      catch (e) { console.error(e); return fail(500, "Something went wrong on the server. Try again."); }
    }
    return env.ASSETS.fetch(req);
  },
};
