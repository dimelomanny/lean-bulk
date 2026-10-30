# Lean Bulk PWA
Static, installable meal-plan app (no build step). Files: index.html, app.js, data.js, styles.css, sw.js, manifest.webmanifest, icons/.
All logs stay in the phone's localStorage. Works offline after first load.
Deploy: serve this folder over HTTPS (e.g. GitHub Pages from the repo root, branch main). All paths are relative, so a /repo-name/ subpath works.
After changing any file, bump CACHE in sw.js (lean-bulk-v1 -> v2) so phones pick up the update.

## Grocery List
Tap **🛒 Grocery List** (top-right of the header) or open `#grocery` for the full two-week list: quantities per trip, ❄️/🧂 markers, estimated prices (checked Oct 2026) with totals, check-offs saved on the phone, and stores near Lake Nona Concorde. The data lives in `grocery.js`; the meal plan (`data.js`, `app.js`) is untouched.
It opens on **Week B shop (for Sun Nov 1 prep)**: the Week B list computed from the Week B recipes, with prices, subtotals, a Sun Nov 1 dinner add-on, and its own saved checkboxes. The two-week list is under the Both trips / Trip 1 / Trip 2 chips.
