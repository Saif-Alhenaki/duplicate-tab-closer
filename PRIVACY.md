# Privacy Policy — Duplicate Tab Closer

**Last updated: 2026**

Duplicate Tab Closer is built to respect your privacy.

## What the extension reads

To detect duplicate tabs, the extension reads the URLs and pinned-state of your open tabs locally inside your browser. This is done only while the extension is running and only on your own device.

## What the extension stores

The extension stores a small map of `tab id → last-touched timestamp` in your browser's session storage. This is used to decide which duplicate to keep when you click the icon. The map is cleared automatically when you close your browser.

## What is shared, sold, or transmitted

**Nothing.** The extension:

- Does **not** send any data to any server.
- Does **not** make any network requests.
- Does **not** include analytics, tracking, ads, or third-party SDKs.
- Does **not** sell, share, or transfer any data to third parties.
- Does **not** use your data for purposes unrelated to its single function (closing duplicate tabs).

## Permissions used

- `tabs` — to read tab URLs and pinned state so duplicates can be detected, and to close older duplicates when you click the icon.
- `storage` — to remember the last time each tab was activated, so the most-recently-used duplicate is kept.

## Contact

If you have questions about this policy, contact the developer through the listing page on the Chrome Web Store.
