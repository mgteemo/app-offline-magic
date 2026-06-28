// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Build a fully static SPA so the app can be packaged into Capacitor (Android/iOS)
    // and run offline from file:// without any Node server. No custom server entry
    // is needed in SPA mode — nothing runs on a server in production.
    spa: { enabled: true },
    pages: [
      { path: "/", prerender: { enabled: true, crawlLinks: true } },
    ],
  },
});
