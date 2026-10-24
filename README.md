# Lean Bulk PWA
Static, installable meal-plan app (no build step). Files: index.html, app.js, data.js, styles.css, sw.js, manifest.webmanifest, icons/.
All logs stay in the phone's localStorage. Works offline after first load.
Deploy: serve this folder over HTTPS (e.g. GitHub Pages from the repo root, branch main). All paths are relative, so a /repo-name/ subpath works.
After changing any file, bump CACHE in sw.js (lean-bulk-v1 -> v2) so phones pick up the update.
