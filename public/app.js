// Family Table: the app (vanilla JS, no build step).
(() => {
"use strict";
let R = [], BY = {};
const MAX_VOTES = 5;

/* ---------- Icons ---------- */
const sv = (p, extra="") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
const I = {
  chicken: sv('<path d="M14.5 3.5a5.5 5.5 0 0 1 3.9 9.4c-1.6 1.6-3.6 1.6-5.4 1.4l-3.3 3.3"/><path d="M14.5 3.5c-3 0-5.5 2.5-5.5 5.5 0 1.3.1 2.9-.9 4.4"/><path d="M9.7 17.6a2 2 0 1 1-2.6 2.6 2 2 0 1 1-2.8-2.8 2 2 0 1 1 2.6-2.6"/>'),
  beef: sv('<path d="M4 13c0-5 4-9 9.5-9C18 4 21 6.8 21 10.5c0 4.6-4.2 9.5-10.5 9.5C6.5 20 4 17 4 13z"/><circle cx="15" cy="10" r="2.2"/>'),
  fish: sv('<path d="M2.5 12c3-4.8 9.5-6.2 14-1.4L21 7v10l-4.5-3.6C12 18.2 5.5 16.8 2.5 12z"/><circle cx="8" cy="11" r=".9" fill="currentColor"/>'),
  soup: sv('<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 3.5c-1 1 1 2 0 3.5M12 3c-1 1 1 2 0 3.5M16 3.5c-1 1 1 2 0 3.5"/><path d="M9 21h6"/>'),
  slow: sv('<path d="M5 10h14v6.5A3.5 3.5 0 0 1 15.5 20h-7A3.5 3.5 0 0 1 5 16.5z"/><path d="M3.5 10h17M2.5 12.5H5M19 12.5h2.5"/><path d="M7.5 10a4.5 3 0 0 1 9 0M12 5v2"/>'),
  salad: sv('<path d="M5 19C5 10.5 10.5 5 19.5 4.5 19 13.5 13.5 19 5 19z"/><path d="M5 19 14 10"/>'),
  breakfast: sv('<path d="M12 3c3.9 0 7 6.2 7 10.2A7 7 0 0 1 5 13.2C5 9.2 8.1 3 12 3z"/><circle cx="12" cy="14" r="3"/>'),
  veg: sv('<path d="M14.5 9.5 4 20l2-7.5 5.5-5.5c1.4-1.4 3.6-.8 3 2.5z"/><path d="M15 9l5-2M15 9l2.5-5M15 9l4 .5"/>'),
  sauce: sv('<path d="M10 2.5h4v3.5l2.5 3.5V20a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 20V9.5L10 6z"/><path d="M7.5 13h9"/>'),
  dessert: sv('<path d="M5.5 11h13l-2 9.5h-9z"/><path d="M5 11a7 7 0 0 1 14 0"/><path d="M12 4V2.5"/>'),
  holiday: sv('<path d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
  heart: sv('<path d="M12 20.5s-8-4.7-8-10.4A4.6 4.6 0 0 1 12 7.3a4.6 4.6 0 0 1 8 2.8c0 5.7-8 10.4-8 10.4z"/>'),
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3-4.6-4.4 6.3-.9z"/></svg>',
  clock: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  people: sv('<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.4 3-5 6-5s5.4 1.6 6 5"/><path d="M16 5.5a3 3 0 0 1 0 6M18 14.8c1.7.6 2.7 2.2 3 4.7"/>'),
  bolt: sv('<path d="M13 2.5 4.5 13.5H11L10 21.5 19.5 10H13z"/>'),
  close: sv('<path d="M6 6l12 12M18 6 6 18"/>'),
  left: sv('<path d="m15 5-7 7 7 7"/>'),
  right: sv('<path d="m9 5 7 7-7 7"/>'),
  pot: sv('<path d="M4 10h16v6.5A3.5 3.5 0 0 1 16.5 20h-9A3.5 3.5 0 0 1 4 16.5z"/><path d="M2.5 10h19M9 6.5c0-1 1.3-2 3-2s3 1 3 2"/>'),
  check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>'),
  repeat: sv('<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>'),
  copy: sv('<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>'),
  cart: sv('<path d="M3 4h2.5l2.2 11h10.6l2-8H6.6"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/>'),
};
const CATS = {
  "Chicken and turkey": {k:"chicken", short:"Chicken & turkey"},
  "Beef and pork": {k:"beef", short:"Beef & pork"},
  "Fish and seafood": {k:"fish", short:"Fish & seafood"},
  "Soups and casseroles": {k:"soup", short:"Soups & casseroles"},
  "Slow cooker": {k:"slow", short:"Slow cooker"},
  "Salads and lighter meals": {k:"salad", short:"Salads & lighter"},
  "Breakfast and eggs": {k:"breakfast", short:"Breakfast & eggs"},
  "Vegetables and sides": {k:"veg", short:"Veg & sides"},
  "Sauces, dressings and toppings": {k:"sauce", short:"Sauces & toppings"},
  "Desserts": {k:"dessert", short:"Desserts"},
  "Holidays & entertaining": {k:"holiday", short:"Holidays"},
};
const catOf = r => CATS[r.cat] || {k:"soup", short:r.cat};
const cvar = r => `--c:var(--c-${catOf(r).k})`;
const stamp = r => `<span class="stamp" style="${cvar(r)}">${I[catOf(r).k]}</span>`;

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y,m,d] = s.split("-").map(Number); return new Date(y, m-1, d); };
const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const daysAgo = s => Math.round((today() - parseYmd(s)) / 864e5);
const fmtDay = (s, o={month:"short", day:"numeric"}) => parseYmd(s).toLocaleDateString(undefined, o);
const ago = n => n <= 0 ? "today" : n === 1 ? "yesterday" : n < 7 ? `${n} days ago` : n < 14 ? "last week" : n < 60 ? `${Math.round(n/7)} weeks ago` : `${Math.round(n/30)} months ago`;
function weekStart(off){
  const t = today(); const m = new Date(t); m.setDate(t.getDate() - ((t.getDay()+6)%7));
  if (t.getDay() === 0 || t.getDay() === 6) m.setDate(m.getDate()+7); // weekend: plan next week
  m.setDate(m.getDate() + 7*off); return m;
}
const weekKey = (off=S.weekOff) => ymd(weekStart(off));
const weekLabel = (off=S.weekOff) => "Week of " + weekStart(off).toLocaleDateString(undefined, {month:"long", day:"numeric"});
const uidOf = () => S.uid;
let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k,v) => { try { localStorage.setItem(k, v); } catch {} };

/* ---------- State ---------- */
const S = {
  token: lsGet("fm-token"), me: lsGet("fm-me"), role: "family", sessionMember: null,
  members: [], ratings: {}, wk: {}, log: [], googleClientId: "",
  live: false, readOnly: false, canWrite: true, isOwner: false, uid: null, offline: false, pending: 0,
  q: "", cat: lsGet("ft-cat") || "all", quick: false, sort: lsGet("ft-sort") || "az", weekOff: 0, view: "cookbook", open: null,
};

/* ---------- Server ---------- */
async function call(path, body){
  const r = await fetch("/api" + path, {
    method: body ? "POST" : "GET",
    headers: {"content-type": "application/json", ...(S.token ? {authorization: "Bearer " + S.token} : {})},
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({error: "The server sent something unexpected. Try again."}));
  if (!r.ok) {
    if (r.status === 401 && S.token && path !== "/cook") { forget(); boot(); }
    const e = new Error(j.error || "Something went wrong."); e.status = r.status; throw e;
  }
  return j;
}
function remember(token, me){
  if (token !== undefined) { S.token = token; lsSet("fm-token", token || ""); }
  if (me !== undefined) { S.me = me; lsSet("fm-me", me || ""); }
}
function forget(){ remember("", ""); S.live = false; S.wk = {}; }

async function load(){
  if (!S.token) return;
  const keys = [weekKey(0)]; if (S.weekOff) keys.push(weekKey());
  try {
    const res = await Promise.all(keys.map(k => call("/state?week=" + k)));
    if (S.pending) return; // a save is in flight; reload when it lands
    const g = res[0];
    S.members = g.members; S.role = g.role; S.sessionMember = g.sessionMember; S.googleClientId = g.googleClientId;
    S.ratings = {}; for (const [m, r, n] of g.ratings) (S.ratings[m] ||= {})[r] = n;
    S.log = g.log;
    for (const d of res) {
      const votes = {}; for (const [m, r] of d.votes) (votes[r] ||= []).push(m);
      S.wk[d.week] = {votes, plan: d.plan, shop: d.shop};
    }
    if (S.sessionMember) remember(undefined, S.sessionMember);
    S.isOwner = S.role === "cook";
    if (!S.members.some(m => m.id === S.me)) remember(undefined, "");
    S.uid = S.me || null; S.live = true; S.offline = false;
    if (!S.me) { showPicker(); return; }
    showApp();
  } catch (e) {
    if (e.status === 401) return;
    S.offline = true; render();
  }
}
function mutate(apply, path, body){
  S.pending++;
  apply(); render();
  return call(path, body).catch(e => { toast(e.message); }).finally(() => { S.pending--; if (!S.pending) load(); });
}

/* ---------- Derived numbers ---------- */
function computeStats(){
  const st = {};
  for (const r of R) st[r.id] = {sum:0, n:0, made:0, last:null, dates:[]};
  for (const [, m] of Object.entries(S.ratings)) for (const [rid, v] of Object.entries(m || {})) if (st[rid] && v > 0) { st[rid].sum += v; st[rid].n++; }
  for (const e of S.log) { const s = st[e.r]; if (!s) continue; s.made++; s.dates.push(e.d); if (!s.last || e.d > s.last) s.last = e.d; }
  for (const s of Object.values(st)) { s.avg = s.n ? s.sum / s.n : 0; s.dates.sort().reverse(); }
  return st;
}
const wkOf = key => S.wk[key] || {votes:{}, plan:[], shop:{got:{}, extras:[]}};
function weekVotes(key=weekKey()){
  const out = {};
  for (const [rid, us] of Object.entries(wkOf(key).votes)) if (BY[rid]) out[rid] = us.filter(u => S.members.some(m => m.id === u));
  for (const k of Object.keys(out)) if (!out[k].length) delete out[k];
  return out;
}
const myPicks = () => Object.entries(wkOf(weekKey(0)).votes).filter(([, us]) => us.includes(S.uid)).map(([r]) => r);
const planOf = key => wkOf(key).plan || [];
function recency(s){
  if (!s.last) return "";
  const d = daysAgo(s.last);
  if (d < 7) return `<span class="pill hot">${I.repeat}Made ${ago(d)}</span>`;
  if (d < 14) return `<span class="pill warm">Made ${ago(d)}</span>`;
  return "";
}

/* ---------- People ---------- */
const member = id => S.members.find(m => m.id === id) || {id, name: "Someone", color: "#889"};
const initial = name => (name || "?").trim().charAt(0) || "?";
const avatar = (m, cls = "") => `<span class="av ${cls}" style="--c:${esc(m.color)}" aria-hidden="true">${esc(initial(m.name))}</span>`;
const pname = id => id === S.uid ? "You" : member(id).name;
const face = id => `<span class="av" style="--c:${esc(member(id).color)}" title="${esc(member(id).name)}">${esc(initial(member(id).name))}</span>`;
const ensureProfiles = () => {};

/* ---------- Writes ---------- */
const canPersonal = () => !!(S.live && S.uid);
function needPersonal(){ if (canPersonal()) return true; toast("Pick who you are first."); return false; }

function rate(rid, n){
  if (!needPersonal()) return;
  const mine = {...(S.ratings[S.uid] || {})};
  const stars = mine[rid] === n ? 0 : n;
  mutate(() => { if (stars) mine[rid] = stars; else delete mine[rid]; S.ratings = {...S.ratings, [S.uid]: mine}; }, "/rate", {member: S.uid, recipe: rid, stars});
}
function toggleVote(rid){
  if (!needPersonal()) return;
  const key = weekKey(0), picks = myPicks(), on = !picks.includes(rid);
  if (on && picks.length >= MAX_VOTES) { toast(`You've used all ${MAX_VOTES} votes. Remove one first.`); return; }
  mutate(() => {
    const w = wkOf(key), votes = {...w.votes};
    votes[rid] = on ? [...(votes[rid] || []), S.uid] : (votes[rid] || []).filter(u => u !== S.uid);
    S.wk[key] = {...w, votes};
  }, "/vote", {member: S.uid, week: key, recipe: rid, on});
  if (on) toast(`Voted for ${BY[rid].name}`);
}
function logMade(rid, d){
  if (!S.isOwner) return;
  d = d || ymd(today());
  mutate(() => { S.log = [{id: "tmp" + Date.now(), r: rid, d}, ...S.log]; }, "/log", {recipe: rid, d});
  toast(`Logged ${BY[rid].name} for ${fmtDay(d)}`);
}
function removeLog(id){ if (S.isOwner) mutate(() => { S.log = S.log.filter(e => e.id !== id); }, "/log/delete", {id}); }
function setPlan(key, meals){ mutate(() => { S.wk[key] = {...wkOf(key), plan: meals}; }, "/plan", {week: key, meals}); }
function togglePlan(rid, key=weekKey()){
  if (!S.isOwner) return;
  const m = planOf(key);
  if (m.includes(rid)) setPlan(key, m.filter(x => x !== rid));
  else { setPlan(key, [...m, rid]); toast(`Added to the menu for ${weekLabel().toLowerCase()}`); }
}
function shopOf(key){ return wkOf(key).shop || {got:{}, extras:[]}; }
function setShop(key, s){ mutate(() => { S.wk[key] = {...wkOf(key), shop: s}; }, "/shop", {week: key, got: s.got, extras: s.extras}); }

/* ---------- Groceries ---------- */
const FR = {"½":.5,"¼":.25,"¾":.75,"⅓":1/3,"⅔":2/3,"⅛":.125};
function pnum(s){
  if (!s) return null; s = s.trim();
  let m = s.match(/^(\d+)\/(\d+)$/); if (m) return m[1]/m[2];
  m = s.match(/^(\d+(?:\.\d+)?)?\s*([½¼¾⅓⅔⅛])?$/); if (m && (m[1] || m[2])) return (m[1] ? +m[1] : 0) + (m[2] ? FR[m[2]] : 0);
  return null;
}
const UNIT = {lb:"lb",lbs:"lb",pound:"lb",pounds:"lb",oz:"oz",ounce:"oz",ounces:"oz",cup:"cup",cups:"cup",tbsp:"tbsp",tablespoon:"tbsp",tablespoons:"tbsp",tsp:"tsp",teaspoon:"tsp",teaspoons:"tsp",clove:"clove",cloves:"clove",can:"can",cans:"can",jar:"jar",jars:"jar",package:"pkg",packages:"pkg",pkg:"pkg",bunch:"bunch",head:"head",heads:"head",slice:"slice",slices:"slice",stalk:"stalk",stalks:"stalk",bag:"bag",bags:"bag",box:"box",pint:"pint",quart:"quart",qt:"quart",fillet:"fillet",fillets:"fillet",piece:"piece",pieces:"piece",sprig:"sprig",sprigs:"sprig",g:"g",kg:"kg",ml:"ml",scoop:"scoop",scoops:"scoop"};
const PLURAL = {cup:1,clove:1,can:1,jar:1,head:1,slice:1,stalk:1,bag:1,pint:1,quart:1,fillet:1,piece:1,sprig:1,scoop:1};
const DROP = /\b(fresh|minced|chopped|diced|sliced|large|small|medium|finely|roughly|thinly|optional)\b/g;
function fmtQ(q){
  const w = Math.floor(q + 1e-9), f = q - w;
  const opts = [[0,""],[.25,"¼"],[1/3,"⅓"],[.5,"½"],[2/3,"⅔"],[.75,"¾"],[1,""]];
  let best = opts[0]; for (const o of opts) if (Math.abs(f - o[0]) < Math.abs(f - best[0])) best = o;
  const whole = w + (best[0] === 1 ? 1 : 0);
  return (whole ? String(whole) : "") + best[1] || "0";
}
function keyOf(name){
  let k = name.toLowerCase().replace(/\(.*?\)/g, "").replace(DROP, "").replace(/\s+/g, " ").trim().replace(/^of /, "");
  k = k.replace(/(\w{3,})ies$/, "$1y").replace(/(tomato|potato)es$/, "$1").replace(/([^s])s$/, "$1");
  return k;
}
function parseIng(line){
  const out = []; let s = line.trim();
  const m = s.match(/^(\d+\/\d+|\d*(?:\.\d+)?\s*[½¼¾⅓⅔⅛]?)(?:\s*[–-]\s*(\d*[½¼¾⅓⅔⅛]?))?\s+(.*)$/);
  let qty = null, unit = "", rest = s;
  if (m && m[1].trim() && pnum(m[1]) != null) {
    qty = pnum(m[2] && pnum(m[2]) != null ? m[2] : m[1]); rest = m[3];
    const w = rest.split(/\s+/)[0].toLowerCase().replace(/\.$/, "");
    if (UNIT[w]) { unit = UNIT[w]; rest = rest.slice(rest.indexOf(" ") + 1); if (rest.split(" ")[0] === w) rest = ""; }
  }
  rest = rest.replace(/^of\s+/i, "");
  let names = [rest];
  if (/^each\s/i.test(rest)) names = rest.replace(/^each\s+/i, "").split(/,\s*|\s+and\s+/);
  else if (qty == null && /,|\sand\s/.test(rest)) { const parts = rest.split(/,\s*|\s+and\s+/); if (parts.every(p => p.split(" ").length <= 3)) names = parts; }
  for (let n of names) {
    n = n.trim(); if (!n) continue;
    let u = unit;
    if (/^garlic cloves?$/i.test(n.replace(DROP, "").trim())) { n = "garlic"; if (!u) u = "clove"; }
    out.push({name: n.replace(DROP, "").replace(/\s+/g, " ").trim() || n, key: keyOf(n), qty, unit: u});
  }
  return out;
}
const AISLES = [
  ["produce", "Produce", /\b(lettuce|romaine|green beans|green onions?)\b/],
  ["frozen", "Frozen", /\bfrozen\b/],
  ["pantry", "Check the pantry", /^(pinch )?(salt|pepper|black pepper|kosher salt|sea salt|water|ice)$|\b(allspice|coriander|turmeric|cocoa|old bay|worcestershire|nutritional yeast|sesame seeds|cream of tartar|oil|olive oil|cooking spray|seasoning|powder|paprika|cumin|oregano|thyme|rosemary|cinnamon|nutmeg|chili flakes|pepper flakes|red pepper flakes|baking soda|baking powder|vanilla|sugar|honey|maple syrup|vinegar|flour|cornstarch|spice|italian seasoning|cajun|bay lea|dried|garlic salt|onion salt|everything bagel)\b/],
  ["cans", "Cans, jars & sauces", /\b(broth|stock|sauce|salsa|beans|coconut milk|paste|pesto|canned|can|jar|olives|pickles|aminos|mustard|ketchup|mayo|mayonnaise|dressing|tuna|chickpeas|enchilada|diced tomatoes|crushed tomatoes|marinara|sriracha|hot sauce|soy|teriyaki|bbq|jam|peanut butter|chips|chipotle|dijon|relish|tahini|pepperoncini)\b/],
  ["meat", "Meat & seafood", /\b(chicken|turkey|beef|pork|steak|sausage|bacon|salmon|shrimp|fish|cod|tilapia|ribs|roast|chuck|ahi|crab|lamb|ham|chops|kielbasa|meatball|sirloin|brisket|tenderloin|mahi|halibut|scallop|seafood|lobster|clams|mussels|thighs|london broil|tofu|patties)\b/],
  ["dairy", "Eggs & dairy-free", /\b(eggs?|dairy-free|milk|cream|butter|cheese|yogurt|feta|parmesan|mozzarella|sour cream|ghee)\b/],
  ["grains", "Bread, pasta & grains", /\b(tortillas?|bread|buns?|pasta|rice|couscous|noodles?|flatbreads?|pita|crumbs|breadcrumbs|oats|quinoa|crackers|spaghetti|penne|macaroni|wraps?|rolls?|panko|naan|crust|cereal|granola|lentils|gnocchi|dough)\b/],
  ["produce", "Produce", /./],
];
function aisleOf(key){ for (const [id, , re] of AISLES) if (re.test(key)) return id; return "produce"; }
const AISLE_ORDER = [["extra","Added by hand"], ["produce","Produce"], ["meat","Meat & seafood"], ["dairy","Eggs & dairy-free"], ["grains","Bread, pasta & grains"], ["cans","Cans, jars & sauces"], ["frozen","Frozen"], ["pantry","Check the pantry"]];
function buildGroceries(meals){
  const items = {};
  for (const rid of meals) {
    const r = BY[rid]; if (!r) continue;
    for (const line of r.ing || []) for (const p of parseIng(line)) {
      let it = items[p.key];
      if (!it) it = items[p.key] = {key:p.key, name:p.name, amt:{}, loose:false, meals:[]};
      if (p.qty != null) it.amt[p.unit] = (it.amt[p.unit] || 0) + p.qty; else it.loose = true;
      if (!it.meals.includes(r.name)) it.meals.push(r.name);
    }
  }
  const groups = {};
  for (const it of Object.values(items)) {
    it.q = Object.entries(it.amt).map(([u, q]) => fmtQ(q) + (u ? " " + u + (PLURAL[u] && q > 1 ? "s" : "") : "")).join(" + ");
    (groups[aisleOf(it.name.toLowerCase())] ||= []).push(it);
  }
  for (const g of Object.values(groups)) g.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}

/* ---------- Render: cookbook ---------- */
let chipsBuilt = false;
function renderChips(){
  const counts = {}; R.forEach(r => counts[r.cat] = (counts[r.cat] || 0) + 1);
  const quickN = R.filter(isQuick).length;
  $("#chips").innerHTML =
    `<button class="chip plain" data-cat="all" aria-pressed="${S.cat==="all"}">All <small>${R.length}</small></button>` +
    `<button class="chip" data-quick="1" aria-pressed="${S.quick}" style="--c:var(--accent)"><span class="dot">${I.bolt}</span>30 minutes or less <small>${quickN}</small></button>` +
    Object.entries(CATS).filter(([c]) => counts[c]).map(([c, v]) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${S.cat===c}" style="--c:var(--c-${v.k})"><span class="dot">${I[v.k]}</span>${esc(v.short)} <small>${counts[c]}</small></button>`).join("");
}
const fmtTime = r => r.mins >= 90 ? (r.mins % 60 ? (r.mins/60).toFixed(1).replace(".0","") : r.mins/60) + " hr" : (r.time || "—");
const fmtServes = r => !r.serves ? "—" : /^\d/.test(r.serves) ? "Serves " + r.serves : "Makes " + r.serves.replace(/^about/i, "about");
const isQuick = r => !!r.quick || (r.mins != null && r.mins <= 30);
function matches(r, q){
  if (!q) return true;
  const hay = (r.name + " " + r.cat + " " + (r.ing || []).join(" ") + " " + (r.occ || []).join(" ")).toLowerCase();
  return q.split(/\s+/).every(w => hay.includes(w));
}
function shelfList(rows, val){
  return `<ol>${rows.map((r, i) => `<li><button data-open="${r.id}"><span class="rk">${i+1}</span><span class="nm">${esc(r.name)}</span><span class="vl">${val(r)}</span></button></li>`).join("")}</ol>`;
}
function renderShelves(st){
  const rated = R.filter(r => st[r.id].n).sort((a, b) => st[b.id].avg - st[a.id].avg || st[b.id].n - st[a.id].n).slice(0, 5);
  const made = R.filter(r => st[r.id].made).sort((a, b) => st[b.id].made - st[a.id].made || a.name.localeCompare(b.name)).slice(0, 5);
  const comeback = R.filter(r => st[r.id].avg >= 4 && (!st[r.id].last || daysAgo(st[r.id].last) >= 30)).sort((a, b) => (st[a.id].last || "") .localeCompare(st[b.id].last || "") || st[b.id].avg - st[a.id].avg).slice(0, 5);
  const el = $("#shelves");
  if (!rated.length && !made.length) {
    el.innerHTML = `<div class="intro">
      <div><b>1 · Rate what you eat</b><p>Open any recipe and give it stars. Everyone's ratings add up to the family favorites.</p></div>
      <div><b>2 · Vote for the week</b><p>Tap the heart on up to ${MAX_VOTES} meals you want. The cook sees the tally under This week.</p></div>
      <div><b>3 · The cook logs it</b><p>Each time a meal is made it's logged, so the book shows what's been on repeat lately.</p></div></div>`;
    return;
  }
  const star = `<span style="color:var(--butter)">${I.star}</span>`;
  el.innerHTML = `<div class="shelves">
    <div class="shelf"><h2 style="color:var(--butter)">${I.star}<span style="color:var(--ink)">Family favorites</span></h2>${rated.length ? shelfList(rated, r => st[r.id].avg.toFixed(1) + " ★") : `<p class="empty">No ratings yet.</p>`}</div>
    <div class="shelf"><h2 style="color:var(--accent)">${I.pot}<span style="color:var(--ink)">Most made</span></h2>${made.length ? shelfList(made, r => st[r.id].made + "×") : `<p class="empty">Nothing logged yet.</p>`}</div>
    <div class="shelf"><h2 style="color:var(--herb)">${I.repeat}<span style="color:var(--ink)">Due for a comeback</span></h2>${comeback.length ? shelfList(comeback, r => st[r.id].last ? ago(daysAgo(st[r.id].last)) : "not logged") : `<p class="empty">Meals rated 4★ or more that haven't been made in a month show up here.</p>`}</div>
  </div>`;
}
function card(r, st, picks, plan){
  const s = st[r.id], voted = picks.includes(r.id);
  const voters = weekVotes(weekKey(0))[r.id] || [];
  return `<article class="card" style="${cvar(r)}">
    <button class="card-hit" data-open="${r.id}" aria-label="Open ${esc(r.name)}"></button>
    <div class="card-top">${stamp(r)}<span class="cat-label">${esc(catOf(r).short)}</span>
      <button class="heart" data-vote="${r.id}" aria-pressed="${voted}" aria-label="${voted ? "Remove vote for" : "Vote for"} ${esc(r.name)}" ${S.live ? "" : "disabled"}>${I.heart}</button></div>
    <h3>${esc(r.name)}</h3>
    <div class="meta"><span>${I.clock}${esc(fmtTime(r))}</span><span>${I.people}${esc(fmtServes(r))}</span></div>
    <div class="card-foot">
      ${s.n ? `<span class="rating-mini">${I.star}${s.avg.toFixed(1)} <span style="color:var(--muted)">(${s.n})</span></span>` : `<span class="rating-mini none">Not rated</span>`}
      ${s.made ? `<span class="made">made ${s.made}×</span>` : ""}
      ${recency(s)}
      ${plan.includes(r.id) ? `<span class="pill menu">On the menu</span>` : ""}
      ${voters.length ? `<span class="votes-on faces" title="${voters.length} vote${voters.length>1?"s":""} this week">${voters.slice(0,4).map(face).join("")}</span>` : ""}
    </div>
  </article>`;
}
function renderCookbook(){
  const st = computeStats(), picks = myPicks(), plan = planOf(weekKey(0));
  if (!chipsBuilt) { chipsBuilt = true; }
  renderChips();
  renderShelves(st);
  const q = S.q.trim().toLowerCase();
  let rows = R.filter(r => (S.cat === "all" || r.cat === S.cat) && (!S.quick || isQuick(r)) && matches(r, q));
  const by = {
    az: (a, b) => a.name.localeCompare(b.name),
    liked: (a, b) => st[b.id].avg - st[a.id].avg || st[b.id].n - st[a.id].n || a.name.localeCompare(b.name),
    made: (a, b) => st[b.id].made - st[a.id].made || a.name.localeCompare(b.name),
    since: (a, b) => (st[a.id].last || "0").localeCompare(st[b.id].last || "0") || a.name.localeCompare(b.name),
    fast: (a, b) => (a.mins ?? 999) - (b.mins ?? 999) || a.name.localeCompare(b.name),
  };
  rows.sort(by[S.sort] || by.az);
  const titleBits = [S.cat === "all" ? "All recipes" : catOf({cat:S.cat}).short]; if (S.quick) titleBits.push("quick");
  $("#resTitle").textContent = q ? `Results for “${S.q.trim()}”` : titleBits.join(", ");
  $("#resCount").textContent = `${rows.length} of ${R.length}`;
  $("#grid").innerHTML = rows.length ? rows.map(r => card(r, st, picks, plan)).join("") : `<div class="empty-results"><b style="font-family:var(--f-display);font-size:1.1rem;color:var(--ink)">No recipes match.</b><br>Try a single ingredient, or clear the section filter.</div>`;
  $("#sort").value = S.sort;
}

/* ---------- Render: week ---------- */
function renderWeek(){
  const key = weekKey(), st = computeStats(), tally = weekVotes(key), plan = planOf(key);
  const isNow = S.weekOff === 0, picks = isNow ? myPicks() : [];
  const ranked = Object.entries(tally).sort((a, b) => b[1].length - a[1].length || (st[b[0]].avg - st[a[0]].avg));
  const maxV = ranked.length ? ranked[0][1].length : 1;
  ensureProfiles(Object.values(tally).flat());
  const ballot = isNow ? `<div class="ballot">${Array.from({length:MAX_VOTES}, (_, i) => `<i class="${i < picks.length ? "on" : ""}">${i < picks.length ? I.heart : ""}</i>`).join("")}<span>${picks.length ? `You've used ${picks.length} of ${MAX_VOTES} votes` : `You have ${MAX_VOTES} votes. Tap the heart on any recipe.`}</span></div>` : "";
  const tallyHtml = ranked.length ? `<ol class="tally">${ranked.map(([rid, us], i) => { const r = BY[rid], s = st[rid]; return `<li>
      <span class="rk">${i+1}</span>
      <div style="min-width:0"><button class="linkish" data-open="${rid}">${esc(r.name)}</button>
        <div class="sub"><span class="faces">${us.map(face).join("")}</span><span>${us.length} vote${us.length>1?"s":""}</span>${s.n ? `<span class="rating-mini">${I.star}${s.avg.toFixed(1)}</span>` : ""}${recency(s)}</div>
        <div class="bar"><b style="width:${Math.round(us.length / maxV * 100)}%"></b></div></div>
      <div>${S.isOwner ? (plan.includes(rid) ? `<button class="btn sm ghost" data-plan="${rid}">${I.check}On menu</button>` : `<button class="btn sm" data-plan="${rid}">${I.plus}Menu</button>`) : (plan.includes(rid) ? `<span class="pill menu">On the menu</span>` : "")}</div>
    </li>`; }).join("")}</ol>` : `<div class="blank"><b>No votes yet${isNow ? "" : " for this week"}.</b>${isNow ? "Browse the cookbook and tap the heart on the meals you want." : "Votes are only collected for the week coming up."}</div>`;
  const madeThisWeek = new Set(S.log.filter(e => { const d = parseYmd(e.d); const s = weekStart(S.weekOff); const end = new Date(s); end.setDate(s.getDate()+7); return d >= s && d < end; }).map(e => e.r));
  const menuHtml = plan.length ? `<ul class="menu-list">${plan.map(rid => { const r = BY[rid]; if (!r) return ""; const done = madeThisWeek.has(rid); return `<li class="${done ? "done" : ""}">${stamp(r)}
      <div style="min-width:0"><button class="linkish" data-open="${rid}" style="all:unset;cursor:pointer;font-weight:600">${esc(r.name)}</button><div class="meta" style="font-size:.78rem">${esc(fmtTime(r))}${done ? ` · <span style="color:var(--herb);font-weight:600">made</span>` : ""}</div></div>
      <div class="acts">${S.isOwner ? `${done ? "" : `<button class="btn sm good" data-made="${rid}" title="Log as made today">${I.check}Made</button>`}<button class="iconbtn" style="width:32px;height:32px;border-radius:9px" data-plan="${rid}" aria-label="Remove from menu">${I.close}</button>` : ""}</div>
    </li>`; }).join("")}</ul>` : `<div class="blank"><b>The menu is empty.</b>${S.isOwner ? "Add meals from the votes, or open any recipe and add it." : "The cook picks the menu from the votes."}</div>`;
  $("#v-week").innerHTML = `
    <div class="view-head"><div><h2>${weekLabel()}</h2><p>${isNow ? "Vote on what you want this week. The cook picks the menu." : S.weekOff < 0 ? "A past week." : "Planning ahead."}</p></div>
      <div class="weeknav"><button class="iconbtn" data-week="-1" aria-label="Previous week">${I.left}</button>${S.weekOff ? `<button class="btn sm ghost" data-week="0">This week</button>` : ""}<button class="iconbtn" data-week="1" aria-label="Next week">${I.right}</button></div></div>
    <div class="two">
      <div class="panel"><h3>Family votes</h3><p class="hint">Meals made in the last two weeks are flagged, so nothing repeats too soon.</p>${ballot}${tallyHtml}</div>
      <div class="panel"><h3>The menu <span class="mono" style="font-size:.85rem;color:var(--muted)">${plan.length} meal${plan.length===1?"":"s"}</span></h3><p class="hint">${S.isOwner ? "Tap Made when you cook one; it goes in the kitchen log." : "What the cook has planned."}</p>${menuHtml}
        ${plan.length ? `<p style="margin:14px 0 0"><a class="btn" href="#groceries">${I.cart}Grocery list</a></p>` : ""}</div>
    </div>`;
}

/* ---------- Render: groceries ---------- */
function renderGroceries(){
  const key = weekKey(), plan = planOf(key), shop = shopOf(key);
  const groups = buildGroceries(plan);
  for (const x of shop.extras || []) (groups.extra ||= []).push({key:"x:" + x, name:x, q:"", meals:[], extra:true});
  const all = Object.values(groups).flat(), got = all.filter(i => shop.got && shop.got[i.key]).length;
  const order = AISLE_ORDER;
  const canShop = S.live && !S.readOnly && S.canWrite !== false;
  const body = plan.length || (shop.extras || []).length ? `<div class="aisles">${order.filter(([id]) => groups[id]).map(([id, label]) => `<div class="aisle"><h3>${esc(label)}</h3><ul>${groups[id].map(it => `<li><label class="gi ${shop.got && shop.got[it.key] ? "got" : ""}"><input type="checkbox" data-got="${esc(it.key)}" ${shop.got && shop.got[it.key] ? "checked" : ""} ${canShop ? "" : "disabled"}><span><span class="n">${esc(it.name.charAt(0).toUpperCase() + it.name.slice(1))}</span>${it.extra && canShop ? `<button class="x" data-unextra="${esc(it.name)}">remove</button>` : ""}${it.meals.length ? `<span class="for">${esc(it.meals.join(" · "))}</span>` : ""}</span><span class="q">${esc(it.q)}</span></label></li>`).join("")}</ul></div>`).join("")}</div>` :
    `<div class="blank"><b>No menu for ${esc(weekLabel().replace("Week of ", ""))} yet.</b>The list fills in from the meals on the menu under This week.</div>`;
  $("#v-groceries").innerHTML = `
    <div class="view-head"><div><h2>Groceries</h2><p>${weekLabel()} · ${plan.length} meal${plan.length===1?"":"s"} on the menu</p></div>
      <div class="weeknav"><button class="iconbtn" data-week="-1" aria-label="Previous week">${I.left}</button>${S.weekOff ? `<button class="btn sm ghost" data-week="0">This week</button>` : ""}<button class="iconbtn" data-week="1" aria-label="Next week">${I.right}</button></div></div>
    <div class="panel">
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="progress"><div class="bar"><b style="width:${all.length ? Math.round(got/all.length*100) : 0}%"></b></div><span class="mono">${got} of ${all.length} in the cart</span></div>
        <button class="btn ghost sm" id="copyList" ${all.length ? "" : "disabled"}>${I.copy}Copy list</button>
      </div>
      ${canShop ? `<form class="addrow" id="addExtra"><input id="extraIn" placeholder="Add something else: milk, paper towels…" autocomplete="off"><button class="btn" type="submit">${I.plus}Add</button></form>` : ""}
      ${body}
      <p class="fine" style="margin-top:8px">Amounts are added up from each recipe's ingredient list. Check labels for gluten and dairy as the cookbook advises.</p>
    </div>`;
}
function listText(){
  const key = weekKey(), groups = buildGroceries(planOf(key)), shop = shopOf(key);
  let t = `Groceries, ${weekLabel().toLowerCase()}\n`;
  if ((shop.extras || []).length) t += `\nAdded by hand\n` + shop.extras.map(x => `- ${x}`).join("\n") + "\n";
  for (const [id, label] of AISLE_ORDER.slice(1)) {
    if (!groups[id]) continue;
    t += `\n${label}\n` + groups[id].filter(i => !(shop.got && shop.got[i.key])).map(i => `- ${i.name}${i.q ? " (" + i.q + ")" : ""}`).join("\n") + "\n";
  }
  return t;
}

/* ---------- Render: log ---------- */
function renderLog(){
  const st = computeStats(), entries = [...S.log].sort((a, b) => b.d.localeCompare(a.d));
  const t = today(), monthKey = ymd(t).slice(0, 7);
  const thisMonth = entries.filter(e => e.d.startsWith(monthKey)).length;
  const distinct = new Set(entries.map(e => e.r)).size;
  const byMonth = {}; for (const e of entries) (byMonth[e.d.slice(0, 7)] ||= []).push(e);
  const options = R.map(r => `<option value="${esc(r.name)}"></option>`).join("");
  $("#v-log").innerHTML = `
    <div class="view-head"><div><h2>Kitchen log</h2><p>Every meal the cook has made, newest first.</p></div></div>
    <div class="statrow">
      <div class="stat"><b>${entries.length}</b><span>meals logged</span></div>
      <div class="stat"><b>${distinct}</b><span>different recipes</span></div>
      <div class="stat"><b>${thisMonth}</b><span>this month</span></div>
    </div>
    <div class="panel">
      ${S.isOwner ? `<h3>Log a meal</h3><p class="hint">Pick a recipe and the day you made it.</p>
        <form class="logform" id="logForm"><input id="logName" list="recipeNames" placeholder="Start typing a recipe name" autocomplete="off" required><input id="logDate" type="date" value="${ymd(t)}" max="${ymd(t)}" required><button class="btn" type="submit">${I.plus}Log it</button></form><datalist id="recipeNames">${options}</datalist>` : ""}
      ${entries.length ? Object.entries(byMonth).map(([m, es]) => `<div class="month"><h4>${parseYmd(m + "-01").toLocaleDateString(undefined, {month:"long", year:"numeric"})}</h4>${es.map(e => { const r = BY[e.r]; if (!r) return ""; return `<div class="entry"><span class="d">${fmtDay(e.d, {weekday:"short", day:"numeric"})}</span>${stamp(r)}<button class="linkish" data-open="${r.id}" style="all:unset;cursor:pointer;font-weight:600;min-width:0">${esc(r.name)} <span class="made" style="font-weight:400">· ${st[r.id].made}×</span></button>${S.isOwner ? `<button class="btn sm ghost" data-unlog="${e.id}" aria-label="Delete this entry">${I.close}</button>` : "<span></span>"}</div>`; }).join("")}</div>`).join("")
        : `<div class="blank" style="margin-top:12px"><b>Nothing logged yet.</b>${S.isOwner ? "When you cook a meal, tap Made on the menu, open the recipe and log it, or use the form above." : "The cook's meals will show up here."}</div>`}
    </div>`;
}

/* ---------- Render: recipe sheet ---------- */
function renderSheet(){
  const dlg = $("#dlg"); const r = BY[S.open]; if (!r) return;
  const st = computeStats()[r.id], mine = (S.ratings[S.uid] || {})[r.id] || 0;
  const raters = Object.entries(S.ratings).filter(([, m]) => m && m[r.id] > 0);
  ensureProfiles(raters.map(([u]) => u));
  const voted = myPicks().includes(r.id), onMenu = planOf(weekKey(0)).includes(r.id);
  const steps = (r.dir || "").split(/(?<=\.)\s+(?=[A-Z])/).filter(Boolean);
  const canRate = canPersonal();
  const keepChecks = [...dlg.querySelectorAll(".ing input")].map(i => i.checked);
  dlg.innerHTML = `<div class="sheet" style="${cvar(r)}">
    <div class="sheet-head">
      <div class="row">${stamp(r)}<span class="cat-label">${esc(catOf(r).short)}</span><button class="close" data-close aria-label="Close">${I.close}</button></div>
      <h2>${esc(r.name)}</h2>
      <div class="meta"><span>${I.clock}${esc(fmtTime(r))}</span><span>${I.people}${esc(fmtServes(r))}</span></div>
      <div class="tagset">${isQuick(r) ? "<span>Quick dinner</span>" : ""}${(r.occ || []).map(o => `<span>${esc(o)}</span>`).join("")}${r.src ? `<span>${esc(r.src)}</span>` : ""}</div>
    </div>
    <div class="sheet-body">
      <div class="boxes">
        <div class="box"><h4>Your rating</h4>
          <div class="stars" role="group" aria-label="Rate ${esc(r.name)}">${[1,2,3,4,5].map(n => `<button data-rate="${n}" class="${n <= mine ? "on" : ""}" aria-label="${n} star${n>1?"s":""}" aria-pressed="${n === mine}" ${canRate ? "" : "disabled"}>${I.star}</button>`).join("")}</div>
          ${raters.length ? `<ul class="who">${raters.map(([u, m]) => `<li>${face(u)}<span>${esc(pname(u))}</span><span class="s">${"★".repeat(m[r.id])}<span style="color:var(--line)">${"★".repeat(5 - m[r.id])}</span></span></li>`).join("")}</ul><p class="fine" style="margin-top:6px">Family average ${st.avg.toFixed(1)} from ${st.n}</p>` : `<p class="fine" style="margin-top:6px">${canRate ? "Nobody has rated this yet. Tap a star." : "No ratings yet."}</p>`}
        </div>
        <div class="box"><h4>History</h4>
          <div><span class="big">${st.made}×</span> <span style="color:var(--muted)">made${st.last ? `, most recently ${ago(daysAgo(st.last))}` : ""}</span></div>
          ${st.dates.length ? `<div class="dates">${st.dates.slice(0, 8).map(d => `<span>${fmtDay(d, {month:"short", day:"numeric", year:"2-digit"})}</span>`).join("")}</div>` : `<p class="fine" style="margin-top:6px">Not logged yet.</p>`}
          ${S.isOwner ? `<form class="logrow" id="sheetLog"><input type="date" id="sheetDate" value="${ymd(today())}" max="${ymd(today())}" aria-label="Date made"><button class="btn sm good" type="submit">${I.check}Log as made</button></form>` : ""}
        </div>
      </div>
      <div class="actionbar">
        <button class="heart" data-vote="${r.id}" aria-pressed="${voted}" ${S.live ? "" : "disabled"}>${I.heart}${voted ? "Voted for this week" : "Vote for this week"}</button>
        ${S.isOwner ? `<button class="btn ${onMenu ? "ghost" : ""}" data-plan0="${r.id}">${onMenu ? I.check + "On this week's menu" : I.plus + "Add to this week's menu"}</button>` : (onMenu ? `<span class="pill menu" style="align-self:center">On this week's menu</span>` : "")}
      </div>
      <div><h3>Ingredients</h3><ul class="ing">${(r.ing || []).map((x, i) => `<li><label><input type="checkbox" ${keepChecks[i] ? "checked" : ""}><span>${esc(x)}</span></label></li>`).join("")}</ul></div>
      <div><h3>Directions</h3><ol class="steps">${steps.map(s => `<li><span>${esc(s)}</span></li>`).join("")}</ol></div>
      ${(r.note || []).map(n => `<p class="fine">${esc(n)}</p>`).join("")}
    </div></div>`;
}
function openRecipe(id){
  S.open = id; renderSheet();
  const d = $("#dlg"); if (!d.open) d.showModal();
  d.querySelector(".sheet").scrollTop = 0;
}

/* ---------- Render: chrome ---------- */
function setView(v){
  if (!["cookbook","week","groceries","log"].includes(v)) v = "cookbook";
  S.view = v;
  for (const id of ["cookbook","week","groceries","log"]) $("#v-" + id).hidden = id !== v;
  document.querySelectorAll(".tabs a").forEach(a => { if (a.dataset.v === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  render();
}
function renderChrome(){
  const me = $("#me");
  if (S.uid) me.innerHTML = `${face(S.uid)}<span>${esc(member(S.uid).name)}${S.isOwner ? " · cook" : ""}</span>`;
  const n = Object.keys(weekVotes(weekKey(0))).length, vc = $("#voteCount");
  vc.hidden = !n; vc.textContent = n;
  const note = $("#notice");
  const msg = S.offline ? "<b>Can't reach the family table right now.</b> You're seeing what was last loaded. Changes won't save until you're back online." : "";
  note.hidden = !msg; note.innerHTML = msg;
  renderInstallBar();
}

/* ---------- Install to home screen ---------- */
let installPrompt = null;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; renderInstallBar(); });
addEventListener("appinstalled", () => { installPrompt = null; lsSet("fm-install-done", "1"); renderInstallBar(); });
function installHelp(){
  if (standalone()) return `<p>You're using the home-screen app.</p>`;
  if (installPrompt) return `<p>Put Family Table on this phone's home screen so it opens like an app.</p><div><button class="btn" data-install>${I.plus}Add to home screen</button></div>`;
  if (isIOS) return `<ol class="steps-sm"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (the square with an arrow).</li><li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li></ol>`;
  return `<ol class="steps-sm"><li>On Android, open this page in <b>Chrome</b>.</li><li>Tap the <b>⋮</b> menu, then <b>Add to Home screen</b> or <b>Install app</b>.</li></ol>`;
}
function renderInstallBar(){
  const bar = $("#installbar");
  const show = S.live && !standalone() && !lsGet("fm-install-done") && (installPrompt || isIOS);
  bar.hidden = !show;
  if (!show) return;
  bar.innerHTML = installPrompt
    ? `<p><b>Make it an app.</b> Add Family Table to your home screen.</p><button class="btn sm" data-install>Add</button><button class="linkbtn" data-installno>Not now</button>`
    : `<p><b>Make it an app:</b> tap Share, then <b>Add to Home Screen</b>.</p><button class="linkbtn" data-installno>Got it</button>`;
}

/* ---------- Gate: setup, sign in, who are you ---------- */
const LOGO = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" fill="#fff" stroke="#D3D9E6"/><circle cx="24" cy="24" r="16.5" fill="none" stroke="#182F95" stroke-width="2.5"/><circle cx="24" cy="24" r="11" fill="#DB3F27"/><path d="M19 23.2c0-2.4 2.2-3.7 5-1.6 2.8-2.1 5-.8 5 1.6 0 2.7-3.2 4.9-5 6.1-1.8-1.2-5-3.4-5-6.1z" fill="#fff"/></svg>`;
const brandmark = sub => `<div class="brandmark">${LOGO}<div><h1>Family Table</h1>${sub ? `<p>${sub}</p>` : ""}</div></div>`;
function showGate(html){
  $("#app").hidden = true; $("#gate").hidden = false;
  $("#gateCard").innerHTML = html;
  const f = $("#gateCard input"); if (f) setTimeout(() => f.focus(), 50);
}
function showApp(){
  if ($("#app").hidden) { $("#gate").hidden = true; $("#app").hidden = false; }
  render();
}
const setErr = msg => { const e = $("#gateErr"); if (e) e.textContent = msg || ""; };

function showSetup(){
  showGate(`${brandmark("Let's set up your family's cookbook.")}
    <form id="setupForm" class="fam" style="gap:14px">
      <label class="field"><span>Your name</span><input class="inp" id="suName" autocomplete="given-name" required maxlength="40" placeholder="Mom"><small>You're the cook. You set the menu and log what you make.</small></label>
      <label class="field"><span>Your Gmail <small>(optional)</small></span><input class="inp" id="suEmail" type="email" autocomplete="email" placeholder="you@gmail.com"><small>Lets you sign in with Google later.</small></label>
      <label class="field"><span>Cook PIN</span><input class="inp pin" id="suPin" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" required placeholder="••••"><small>4 to 8 digits. Keeps the kids out of the cook's tools.</small></label>
      <label class="field"><span>Family code</span><input class="inp" id="suCode" required minlength="4" maxlength="40" autocomplete="off" placeholder="tacotuesday"><small>Everyone types this once to get in. Pick something easy to say out loud.</small></label>
      <label class="field"><span>Everyone else in the family</span><textarea class="inp" id="suMembers" placeholder="Dad&#10;Emma&#10;Jack"></textarea><small>One name per line. You can change this later.</small></label>
      <div class="err" id="gateErr"></div>
      <button class="btn wide" type="submit">Set up Family Table</button>
    </form>`);
}
function showSignIn(clientId){
  showGate(`${brandmark("Rate it, vote on it, cook it.")}
    ${clientId ? `<div class="gbtn" id="gbtn"></div><div class="or">or use the family code</div>` : ""}
    <form id="codeForm" class="fam" style="gap:12px">
      <label class="field"><span>Family code</span><input class="inp" id="codeIn" autocomplete="off" autocapitalize="none" required placeholder="Ask the cook"></label>
      <div class="err" id="gateErr"></div>
      <button class="btn wide" type="submit">Come in</button>
    </form>`);
  if (clientId) mountGoogle($("#gbtn"), clientId);
}
function showPicker(pinFor){
  const sorted = [...S.members].sort((a, b) => (b.cook - a.cook));
  if (pinFor) {
    const m = member(pinFor);
    showGate(`${brandmark("")}
      <div style="display:flex;align-items:center;gap:12px">${avatar(m, "")}<h2>Hi ${esc(m.name)}. Enter the cook PIN.</h2></div>
      <form id="pinForm" class="fam" style="gap:12px">
        <input class="inp pin" id="pinIn" inputmode="numeric" maxlength="8" autocomplete="off" required aria-label="Cook PIN">
        <div class="err" id="gateErr"></div>
        <button class="btn wide" type="submit">Unlock</button>
      </form>
      <button class="linkbtn" data-pick="">Back</button>`);
    return;
  }
  showGate(`${brandmark("")}
    <h2>Who's using Family Table?</h2>
    <div class="people">${sorted.map(m => `<button class="person" style="--c:${esc(m.color)}" data-pick="${m.id}">${avatar(m)}<span>${esc(m.name)}</span>${m.cook ? `<small>${I.pot}Cook</small>` : ""}</button>`).join("")}</div>
    <p style="font-size:.85rem">Pick your own name so your stars and votes count as yours.</p>
    <button class="linkbtn" data-signout>Sign out of this device</button>`);
}
async function pick(id){
  if (id === "") { showPicker(); return; }
  const m = member(id);
  if (m.cook && S.role !== "cook") { showPicker(id); return; }
  if (!m.cook && S.role === "cook" && !S.sessionMember) { await call("/uncook", {}).catch(() => {}); S.role = "family"; S.isOwner = false; }
  if (!m.cook && S.role === "cook" && S.sessionMember) { await call("/uncook", {}).catch(() => {}); S.role = "family"; S.isOwner = false; S.sessionMember = null; }
  remember(undefined, id); S.uid = id;
  showApp(); load();
}

/* ---------- Google sign-in ---------- */
function loadGoogle(){
  return new Promise((res, rej) => {
    if (window.google && google.accounts && google.accounts.id) return res();
    const s = document.createElement("script"); s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = res; s.onerror = () => rej(new Error("Google sign-in couldn't load."));
    document.head.appendChild(s);
  });
}
async function mountGoogle(el, clientId){
  try {
    await loadGoogle();
    google.accounts.id.initialize({client_id: clientId, callback: async r => {
      setErr("");
      try { const j = await call("/google", {credential: r.credential}); remember(j.token, j.memberId); await start(); }
      catch (e) { setErr(e.message); }
    }});
    google.accounts.id.renderButton(el, {theme: "outline", size: "large", text: "signin_with", shape: "pill", width: Math.min(320, el.clientWidth || 300)});
  } catch (e) { el.innerHTML = `<p class="fine">Google sign-in isn't available right now. Use the family code.</p>`; }
}

/* ---------- Family sheet ---------- */
S.confirmDel = null;
function openFamily(){ renderFam(); const d = $("#fam"); if (!d.open) d.showModal(); }
function renderFam(){
  const d = $("#fam"), m = member(S.uid), cook = S.isOwner;
  const bound = !!S.sessionMember && !cook;
  const others = S.members;
  d.innerHTML = `<div class="sheet"><div class="sheet-head" style="--c:var(--enamel)">
      <div class="row">${avatar(m, "")}<span class="cat-label">${cook ? "Cook" : "Family"}</span><button class="close" data-famclose aria-label="Close">${I.close}</button></div>
      <h2>${esc(m.name)}</h2></div>
    <div class="sheet-body fam">
      <section><h3>This device</h3>
        <div class="row2">${bound ? "" : `<button class="btn" data-switch>Switch person</button>`}<button class="btn ghost" data-signout>Sign out of this device</button></div>
        ${bound ? `<p>You're signed in with Google as ${esc(m.name)}.</p>` : `<p>On a shared tablet, tap Switch person before someone else rates or votes.</p>`}
      </section>
      <section><h3>Put it on your home screen</h3>${installHelp()}</section>
      ${cook ? `
      <section><h3>Invite the family</h3>
        <p>Send everyone this link and the family code. Anyone with a Gmail listed below can also sign in with Google.</p>
        <div class="row2"><code class="copyable">${esc(location.origin)}</code><button class="btn sm ghost" data-copy="${esc(location.origin)}">${I.copy}Copy link</button></div>
      </section>
      <section><h3>Family members</h3>
        <p>Add a Gmail to someone's name if they want to sign in with Google.</p>
        ${others.map(x => `<div class="memrow">${avatar(x)}<input class="inp" id="mn-${x.id}" value="${esc(x.name)}" maxlength="40" aria-label="Name"><input class="inp em" id="mm-${x.id}" type="email" value="${esc(x.email)}" placeholder="Gmail (optional)" aria-label="Gmail for ${esc(x.name)}">
          <div class="row2" style="flex-wrap:nowrap"><button class="btn sm" data-savemem="${x.id}">Save</button>${x.cook ? "" : `<button class="btn sm ghost" data-delmem="${x.id}">${S.confirmDel === x.id ? "Remove?" : I.close}</button>`}</div></div>`).join("")}
        <form class="row2" id="addMem"><input class="inp" id="newMem" placeholder="Add a name" maxlength="40" required><button class="btn sm" type="submit">${I.plus}Add</button></form>
        <p>Removing someone also removes their ratings and votes.</p>
      </section>
      <section><h3>Family code and cook PIN</h3>
        <form class="row2" id="setCode"><input class="inp" id="newCode" placeholder="New family code" minlength="4" maxlength="40" required autocomplete="off"><button class="btn sm" type="submit">Change code</button></form>
        <form class="row2" id="setPin"><input class="inp" id="newPin" placeholder="New cook PIN (4–8 digits)" inputmode="numeric" pattern="[0-9]{4,8}" maxlength="8" required autocomplete="off"><button class="btn sm" type="submit">Change PIN</button></form>
        <p>Changing the code doesn't sign anyone out. It only affects new sign-ins.</p>
      </section>
      <section><h3>Sign in with Google</h3>
        ${S.googleClientId ? `<p>Google sign-in is on.</p>` : `<p>Off. To turn it on, make a free Google client ID (about 5 minutes):</p>`}
        <ol class="steps-sm">
          <li>Open <a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noopener">Google Cloud: Clients</a> and make a project if it asks (name it Family Table).</li>
          <li>If asked to set up the consent screen: app name Family Table, your email, audience <b>External</b>. Then under Audience, tap <b>Publish app</b> so any family Gmail works.</li>
          <li>Create client → <b>Web application</b>. Under <b>Authorized JavaScript origins</b> add <code class="copyable">${esc(location.origin)}</code></li>
          <li>Copy the <b>Client ID</b> and paste it here.</li>
        </ol>
        <form class="row2" id="setGoogle"><input class="inp" id="gcid" placeholder="…apps.googleusercontent.com" value="${esc(S.googleClientId)}" autocomplete="off"><button class="btn sm" type="submit">Save</button></form>
      </section>` : ""}
    </div></div>`;
}

/* ---------- Render all ---------- */
function render(){
  if ($("#app").hidden) return;
  renderChrome();
  if (S.view === "cookbook") renderCookbook();
  if (S.view === "week") renderWeek();
  if (S.view === "groceries") renderGroceries();
  if (S.view === "log") renderLog();
  if ($("#dlg").open) renderSheet();
}

/* ---------- Events ---------- */
document.addEventListener("click", async e => {
  const t = e.target.closest("button, [data-open]"); if (!t) return;
  const d = t.dataset;
  if (d.vote) { e.stopPropagation(); toggleVote(d.vote); }
  else if (d.open) { $("#fam").open && $("#fam").close(); openRecipe(d.open); }
  else if (d.cat) { S.cat = d.cat; lsSet("ft-cat", S.cat); render(); }
  else if (d.quick) { S.quick = !S.quick; render(); }
  else if (d.rate) rate(S.open, +d.rate);
  else if (d.close !== undefined) $("#dlg").close();
  else if (d.famclose !== undefined) $("#fam").close();
  else if (d.plan) togglePlan(d.plan);
  else if (d.plan0) { togglePlan(d.plan0, weekKey(0)); }
  else if (d.made) logMade(d.made);
  else if (d.unlog) removeLog(d.unlog);
  else if (d.week) { S.weekOff = d.week === "0" ? 0 : S.weekOff + Number(d.week); render(); load(); }
  else if (d.unextra) { e.preventDefault(); const key = weekKey(), s = shopOf(key); setShop(key, {got:{...(s.got||{})}, extras:(s.extras||[]).filter(x => x !== d.unextra)}); }
  else if (t.id === "copyList") copy(listText(), "Copied the list");
  else if (d.copy) copy(d.copy, "Copied");
  else if (t.id === "me") openFamily();
  else if (d.pick !== undefined) pick(d.pick);
  else if (d.switch !== undefined) { $("#fam").close(); remember(undefined, ""); S.uid = null; showPicker(); }
  else if (d.signout !== undefined) { if ($("#fam").open) $("#fam").close(); await call("/logout", {}).catch(() => {}); forget(); start(); }
  else if (d.install !== undefined) { if (installPrompt) { installPrompt.prompt(); const c = await installPrompt.userChoice.catch(() => null); if (c && c.outcome === "accepted") lsSet("fm-install-done", "1"); installPrompt = null; renderInstallBar(); if ($("#fam").open) renderFam(); } }
  else if (d.installno !== undefined) { lsSet("fm-install-done", "1"); renderInstallBar(); }
  else if (d.savemem) {
    const id = d.savemem;
    try { await call("/members", {id, name: $("#mn-" + id).value, email: $("#mm-" + id).value}); toast("Saved"); await load(); renderFam(); } catch (err) { toast(err.message); }
  }
  else if (d.delmem) {
    if (S.confirmDel !== d.delmem) { S.confirmDel = d.delmem; renderFam(); return; }
    S.confirmDel = null;
    try { await call("/members/delete", {id: d.delmem}); toast("Removed"); await load(); renderFam(); } catch (err) { toast(err.message); }
  }
});
function copy(text, ok){
  navigator.clipboard.writeText(text).then(() => toast(ok), () => toast("Couldn't copy here. Select the text and copy it instead."));
}
document.addEventListener("change", e => {
  const t = e.target;
  if (t.id === "sort") { S.sort = t.value; lsSet("ft-sort", S.sort); render(); }
  if (t.dataset.got) { const key = weekKey(), s = shopOf(key); const got = {...(s.got || {})}; if (t.checked) got[t.dataset.got] = true; else delete got[t.dataset.got]; setShop(key, {got, extras:[...(s.extras || [])]}); }
});
document.addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, btn = f.querySelector("[type=submit]");
  const busy = async fn => { if (btn) btn.disabled = true; try { await fn(); } catch (err) { setErr(err.message); if (!$("#gateErr")) toast(err.message); } finally { if (btn) btn.disabled = false; } };
  if (f.id === "sheetLog") logMade(S.open, $("#sheetDate").value);
  if (f.id === "addExtra") { const v = $("#extraIn").value.trim(); if (!v) return; const key = weekKey(), s = shopOf(key); if ((s.extras||[]).includes(v)) return; setShop(key, {got:{...(s.got||{})}, extras:[...(s.extras || []), v]}); }
  if (f.id === "logForm") {
    const name = $("#logName").value.trim().toLowerCase(); const r = R.find(x => x.name.toLowerCase() === name) || R.find(x => x.name.toLowerCase().includes(name));
    if (!r) { toast("Pick a recipe from the list."); return; }
    logMade(r.id, $("#logDate").value);
  }
  if (f.id === "setupForm") busy(async () => {
    const members = $("#suMembers").value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
    const j = await call("/setup", {cookName: $("#suName").value, cookEmail: $("#suEmail").value, cookPin: $("#suPin").value, familyCode: $("#suCode").value, members});
    remember(j.token, j.memberId); await start(); openFamily();
  });
  if (f.id === "codeForm") busy(async () => { const j = await call("/login", {code: $("#codeIn").value}); remember(j.token, ""); await start(); });
  if (f.id === "pinForm") busy(async () => {
    const j = await call("/cook", {pin: $("#pinIn").value});
    remember(undefined, j.memberId); S.role = "cook"; S.isOwner = true; S.uid = j.memberId; showApp(); load();
  });
  if (f.id === "addMem") busy(async () => { await call("/members", {name: $("#newMem").value}); toast("Added"); await load(); renderFam(); });
  if (f.id === "setCode") busy(async () => { await call("/settings", {familyCode: $("#newCode").value}); toast("Family code changed"); f.reset(); });
  if (f.id === "setPin") busy(async () => { await call("/settings", {cookPin: $("#newPin").value}); toast("Cook PIN changed"); f.reset(); });
  if (f.id === "setGoogle") busy(async () => { await call("/settings", {googleClientId: $("#gcid").value}); toast($("#gcid").value.trim() ? "Google sign-in is on" : "Google sign-in is off"); await load(); renderFam(); });
});
let qT; $("#q").addEventListener("input", e => { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value; render(); }, 90); });
for (const id of ["#dlg", "#fam"]) $(id).addEventListener("click", e => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$("#dlg").addEventListener("close", () => { S.open = null; });
$("#fam").addEventListener("close", () => { S.confirmDel = null; });
addEventListener("hashchange", () => setView(location.hash.slice(1)));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.live && !$("#app").hidden) load(); });
setInterval(() => { if (document.visibilityState === "visible" && S.live && !S.pending && !$("#app").hidden) load(); }, 20000);

/* ---------- Start ---------- */
async function start(){
  if (S.token) {
    await load();
    if (S.live) return;
    if (S.offline) { showGate(`${brandmark("")}<h2>Can't reach the family table.</h2><p>Check your connection, then try again.</p><button class="btn wide" data-retry onclick="location.reload()">Try again</button>`); return; }
  }
  try {
    const st = await call("/status");
    if (!st.setup) showSetup(); else showSignIn(st.googleClientId);
  } catch (e) {
    showGate(`${brandmark("")}<h2>Can't reach the family table.</h2><p>Check your connection, then try again.</p><button class="btn wide" onclick="location.reload()">Try again</button>`);
  }
}
async function boot(){
  try { R = await (await fetch("/recipes.json")).json(); } catch { R = []; }
  BY = Object.fromEntries(R.map(r => [r.id, r]));
  $("#q").placeholder = `Search ${R.length} recipes, or an ingredient like “salmon”`;
  S.view = ["cookbook","week","groceries","log"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "cookbook";
  setView(S.view);
  await start();
}
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
boot();
})();
