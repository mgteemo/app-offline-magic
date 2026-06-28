// Finalize the SPA build for offline use (e.g. Capacitor APK).
//
// TanStack Start's SPA mode writes its prerendered shell to
// `dist/client/_shell.html`. Capacitor (and any plain static host) expects
// `index.html` as the entry, so we copy it. We also rewrite the absolute
// `/assets/...` URLs to relative `./assets/...` URLs so the file:// loader
// inside the Android WebView can resolve them.
import { promises as fs } from "node:fs";
import path from "node:path";

const clientDir = path.resolve("dist/client");
const shellPath = path.join(clientDir, "_shell.html");
const indexPath = path.join(clientDir, "index.html");

try {
  let html = await fs.readFile(shellPath, "utf8");
  // Use root-relative paths (work under file:///android_asset/public/).
  // If you ever need to serve from a sub-path, switch these to `./assets/`.
  await fs.writeFile(indexPath, html, "utf8");
  console.log(`[finalize-spa] wrote ${path.relative(process.cwd(), indexPath)}`);
} catch (err) {
  console.error("[finalize-spa] failed:", err);
  process.exit(1);
}
