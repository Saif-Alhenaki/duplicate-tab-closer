// Cross-browser API
const api = (typeof browser !== "undefined") ? browser : chrome;
const KEY = "tabLastAccessed";

// --- URL normalization --------------------------------------------------
// Goal: ignore "noise" that doesn't change the page (tracking codes, www.,
// trailing slashes, # fragments, capitalization in host) while keeping the
// real content params that DO change the page (v, q, id, page, category…).
const TRACKING_PARAMS = new Set([
  // Google Analytics + Ads
  "gclid", "gclsrc", "dclid", "wbraid", "gbraid",
  "gad_source", "gad_campaignid", "gad_campaign", "gad", "gad_id",
  // Facebook / Meta
  "fbclid", "fb_action_ids", "fb_action_types", "fb_ref", "fb_source",
  // Microsoft / Bing
  "msclkid",
  // Yandex
  "yclid", "ymclid", "_openstat",
  // Mailchimp
  "mc_cid", "mc_eid",
  // HubSpot
  "_hsenc", "_hsmi", "hsctatracking", "__hssc", "__hstc", "__hsfp",
  // Instagram
  "igshid", "igsh",
  // TikTok
  "ttclid",
  // Twitter / X
  "twclid",
  // LinkedIn
  "li_fat_id", "trk", "trkcampaign", "trkinfo",
  // Vero
  "vero_id", "vero_conv",
  // Adobe / Omniture / Webtrekk
  "wt_mc", "wt_zmc", "s_kwcid", "ef_id",
  // Generic / share
  "spm", "share_source", "share_token", "share_id", "share_from",
  "ref", "ref_src", "ref_url", "referrer", "from",
  "source", "src", "campaign", "campaignid",
  // Pinned / oft-seen
  "_ga", "_gl", "_branch_match_id",
]);

function isTrackingParam(key) {
  const k = key.toLowerCase();
  if (k.startsWith("utm_"))   return true;
  if (k.startsWith("ga_"))    return true;
  if (k.startsWith("mtm_"))   return true; // Matomo
  if (k.startsWith("pk_"))    return true; // Piwik
  if (k.startsWith("hsa_"))   return true; // HubSpot ads
  if (k.startsWith("vero_"))  return true;
  if (k.startsWith("fb_"))    return true;
  if (k.startsWith("gad_"))   return true;
  if (k.startsWith("oly_"))   return true;
  return TRACKING_PARAMS.has(k);
}

function normalizeUrl(raw) {
  if (!raw) return raw;
  try {
    const u = new URL(raw);

    // Lower-case protocol and hostname (URLs are case-insensitive there)
    let host = u.hostname.toLowerCase();
    // Strip common subdomain prefixes that don't change the page
    if (host.startsWith("www.")) host = host.slice(4);
    if (host.startsWith("m.")) host = host.slice(2);     // mobile mirror
    u.hostname = host;

    // Drop fragment (#section). Anchors don't load different pages.
    u.hash = "";

    // Drop tracking params
    const drop = [];
    for (const k of u.searchParams.keys()) {
      if (isTrackingParam(k)) drop.push(k);
    }
    for (const k of drop) u.searchParams.delete(k);

    // Drop params with empty values (e.g. utm_term=&...)
    const empties = [];
    for (const [k, v] of u.searchParams.entries()) {
      if (v === "") empties.push(k);
    }
    for (const k of empties) u.searchParams.delete(k);

    // Sort remaining params so a=1&b=2 == b=2&a=1
    const entries = [...u.searchParams.entries()].sort(
      ([a], [b]) => a.localeCompare(b)
    );
    u.search = "";
    for (const [k, v] of entries) u.searchParams.append(k, v);

    // Normalize trailing slash on path
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
    u.pathname = path;

    return u.toString();
  } catch {
    return raw;
  }
}

function isSkippable(url) {
  if (!url) return true;
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("opera://") ||
    url.startsWith("brave://") ||
    url.startsWith("about:") ||
    url.startsWith("moz-extension://") ||
    url === "about:blank"
  );
}

// --- Last-touched tracking (persisted via session storage) --------------
async function loadMap() {
  try { const r = await api.storage.session.get(KEY); return r[KEY] || {}; }
  catch { return {}; }
}
async function saveMap(m) {
  try { await api.storage.session.set({ [KEY]: m }); } catch {}
}
async function touchTab(tabId) {
  const m = await loadMap();
  m[tabId] = Date.now();
  await saveMap(m);
  updateBadge();
}
async function forgetTab(tabId) {
  const m = await loadMap();
  delete m[tabId];
  await saveMap(m);
  updateBadge();
}

async function bootstrap() {
  const m = await loadMap();
  const tabs = await api.tabs.query({});
  const now = Date.now();
  const live = new Set();
  for (const t of tabs) {
    live.add(t.id);
    if (t.active) m[t.id] = now;
    else if (!(t.id in m)) m[t.id] = t.lastAccessed || (now - 60000);
  }
  for (const id of Object.keys(m)) {
    if (!live.has(Number(id))) delete m[id];
  }
  await saveMap(m);
  updateBadge();
}

// --- Duplicate logic ----------------------------------------------------
async function getDuplicateGroups() {
  const tabs = await api.tabs.query({});
  const groups = new Map();
  for (const t of tabs) {
    if (isSkippable(t.url)) continue;
    const key = normalizeUrl(t.url);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  const dups = [];
  for (const list of groups.values()) if (list.length > 1) dups.push(list);
  return dups;
}

async function getDuplicateCount() {
  const dups = await getDuplicateGroups();
  let n = 0;
  for (const g of dups) n += g.length - 1;
  return n;
}

async function updateBadge() {
  try {
    const n = await getDuplicateCount();
    await api.action.setBadgeText({ text: n > 0 ? String(n) : "" });
    if (n > 0) await api.action.setBadgeBackgroundColor({ color: "#d93025" });
  } catch {}
}

// mode = "default"     → keep most recently touched tab in each group
// mode = "keepPinned"  → if a group contains pinned tab(s), close only
//                        the non-pinned ones; groups with no pinned tabs
//                        fall back to the default rule
async function closeDuplicates(mode = "default") {
  const dups = await getDuplicateGroups();
  const m = await loadMap();
  const toClose = [];

  for (const group of dups) {
    if (mode === "keepPinned") {
      const hasPinned = group.some(t => t.pinned);
      if (hasPinned) {
        for (const t of group) if (!t.pinned) toClose.push(t.id);
        continue;
      }
      // No pinned in this group → fall through to default behavior
    }

    const sorted = [...group].sort((a, b) => {
      const ta = m[a.id] ?? a.lastAccessed ?? 0;
      const tb = m[b.id] ?? b.lastAccessed ?? 0;
      return tb - ta; // newest-touched first
    });
    for (let i = 1; i < sorted.length; i++) toClose.push(sorted[i].id);
  }

  if (toClose.length) {
    try { await api.tabs.remove(toClose); } catch {}
  }
  updateBadge();
  return toClose.length;
}

// --- Messages from popup ------------------------------------------------
api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg?.type === "getStatus") {
      const count = await getDuplicateCount();
      sendResponse({ count });
    } else if (msg?.type === "closeDuplicates") {
      const closed = await closeDuplicates(msg.mode || "default");
      sendResponse({ closed });
    }
  })();
  return true; // keep the message channel open for the async response
});

// --- Events -------------------------------------------------------------
api.tabs.onActivated.addListener(info => touchTab(info.tabId));
api.tabs.onCreated.addListener(tab => touchTab(tab.id));
api.tabs.onRemoved.addListener(id => forgetTab(id));
api.tabs.onUpdated.addListener((id, info) => {
  if (info.url || info.status === "complete") updateBadge();
});
if (api.tabs.onReplaced) api.tabs.onReplaced.addListener(updateBadge);
if (api.windows && api.windows.onFocusChanged) {
  api.windows.onFocusChanged.addListener(async (winId) => {
    if (winId === api.windows.WINDOW_ID_NONE) return;
    try {
      const [active] = await api.tabs.query({ active: true, windowId: winId });
      if (active) touchTab(active.id);
    } catch {}
  });
}

api.runtime.onInstalled.addListener(bootstrap);
api.runtime.onStartup.addListener(bootstrap);

bootstrap();
