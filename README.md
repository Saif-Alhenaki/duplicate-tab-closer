# Duplicate Tab Closer

A small browser extension that counts duplicate tabs on its icon and, on click, closes the older copies while keeping the one you most recently used.

- Works on Chrome, Brave, Opera, Edge, Firefox (all Chromium browsers + Firefox 115+).
- No network requests. No analytics. No data leaves the device. See `PRIVACY.md`.

## Local install (developer mode)

**Chrome / Brave / Opera / Edge**: open `chrome://extensions` → Developer mode → Load unpacked → pick this folder.

**Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → pick `manifest.json`.

---

## Publishing to the Chrome Web Store

### 1. Things to prepare before submission

- A Google account that you'll use as the developer.
- A one-time **$5 USD** developer registration fee.
- The extension as a ZIP (this folder, zipped — `manifest.json` must be at the root).
- A **128×128 store icon** (already included in `icons/icon128.png`).
- **1 to 5 screenshots** at **1280×800** or **640×400**. Take screenshots of the popup with a few duplicate tabs open.
- *(Optional but helpful)* A **440×280 small promo tile** and **1400×560 marquee promo tile**.

### 2. Submitting

1. Go to <https://chrome.google.com/webstore/devconsole>, sign in, pay the $5 fee.
2. Click "Add new item", upload the ZIP.
3. Fill in the store listing:
   - **Name**: Duplicate Tab Closer
   - **Summary**: Closes duplicate tabs and keeps the one you used most recently.
   - **Category**: Productivity
   - **Detailed description**: explain the badge, the two buttons, and the "keep pinned" mode.
4. Fill in the **Privacy** tab. Mark "I don't collect user data". Paste the contents of `PRIVACY.md` (or host it somewhere and link to it).
5. Fill in the **Permission justifications** — see below.
6. Submit for review. Approval typically takes from a few hours to a few days.

### 3. Permission justifications (copy/paste these)

When the dashboard asks you to justify each permission, use these exact phrasings — short, specific, and reviewer-friendly:

- **`tabs` permission**: "Required to read the URL and pinned state of open tabs in order to detect duplicates, and to call `tabs.remove()` to close older duplicates when the user clicks the action button."
- **`storage` permission (session)**: "Required to remember the last time each tab was activated, so when the user clicks 'Close duplicates' the most-recently-used copy is kept. Data is stored only in session storage and never leaves the device."
- **Single purpose**: "Detect duplicate browser tabs and let the user close older duplicates with one click."
- **Remote code**: "None. All logic is included in the extension package."
- **Data usage**: Tick "Not sold/transferred to third parties" and "Not used or transferred for purposes unrelated to the item's core functionality".

### 4. Other stores

- **Microsoft Edge Add-ons**: <https://partner.microsoft.com/dashboard/microsoftedge>. Free. The same ZIP works.
- **Firefox AMO**: <https://addons.mozilla.org/developers/>. Free. The same ZIP works; you'll need to sign it through AMO for permanent install.
- **Opera Add-ons**: <https://addons.opera.com/developer/>. Free. Same ZIP. (Note: Opera GX users can already install Chrome extensions directly.)

---

## Can I make money from this?

**Short answer:** yes, but with limits, and for a small utility like this don't expect much.

- Google's built-in payments system was **shut down in 2021**. The Chrome Web Store no longer processes payments for you.
- You **can** still monetize, but you need to handle billing yourself. Common options:
  - **Donations** — add a "Buy me a coffee" / PayPal link in the popup. Easiest, lowest revenue.
  - **Freemium via third-party** — [ExtensionPay](https://extensionpay.com) (or Stripe directly) lets you gate "Pro" features behind a paid license. For this extension, a paid tier could add things like keyboard shortcuts, auto-close mode, or per-site rules.
  - **Affiliate links** — not really applicable to this kind of utility, and the Web Store has strict rules about disclosure.
  - **Ads** — technically allowed but heavily restricted, looks spammy, and tanks ratings. Don't.
  - **Selling user data** — strictly banned. Don't even consider it; it will get you permanently delisted.
- Realistic expectations: most extensions earn **$0**. The ones that earn well solve a clear pain point for a specific audience (Grammarly, Honey, etc.). A tab cleanup tool typically does best as free + optional donations.

If you ever want to add a "Pro" tier with ExtensionPay, tell me and I'll wire it in.

---

## Files in this package

- `manifest.json` — extension manifest.
- `background.js` — duplicate detection + close logic.
- `popup.html`, `popup.js` — the popup UI with the two buttons.
- `icons/` — 16/48/128 px icons.
- `PRIVACY.md` — privacy policy you'll paste into the store listing.
- `LICENSE` — MIT.
