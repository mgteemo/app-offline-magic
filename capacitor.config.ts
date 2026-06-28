import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor config for packaging this app as a native Android/iOS shell.
//
// IMPORTANT: do NOT set `server.url` here. That option makes the installed
// app load from a remote URL (e.g. your PC's localhost) and is exactly what
// caused the "can't reach localhost" error when Wi-Fi was off.
//
// `webDir` points at the static SPA build produced by `npm run build`
// (TanStack Start in SPA + prerender mode emits everything under
// `.output/public/`, including a usable `index.html`).
const config: CapacitorConfig = {
  appId: "app.lovable.myanmarfontstudio",
  appName: "Myanmar Font Studio",
  webDir: ".output/public",
};

export default config;
