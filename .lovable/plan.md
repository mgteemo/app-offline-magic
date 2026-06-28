## Goal
Make `npm run build` produce a static folder (HTML + JS + CSS + assets) with no Node server, so Capacitor can copy it into the APK and the app works fully offline (no localhost, no Wi‑Fi).

## Why your current build fails offline
- TanStack Start is SSR-first. `vite build` emits `.output/server` (a Nitro server bundle) and `.output/public` (only static assets — no usable `index.html`).
- The SSR `index.html` expects a running server, so opening it via `file://` inside Capacitor shows a white screen or "can't reach localhost".
- There is no `dist/` because Vite is configured for SSR output, not a static SPA.

Your project has **no server functions** and only the `/` route, so a pure client SPA build is safe.

## Changes

### 1. Enable SPA + prerender in TanStack Start
In `vite.config.ts`, configure the TanStack Start plugin to produce a static client build:

```ts
tanstackStart({
  spa: { enabled: true },       // single index.html shell, client-side routing
  prerender: {                   // emit static HTML for the home route
    enabled: true,
    crawlLinks: true,
    routes: ["/"],
  },
})
```

This makes the build emit a fully static site under `.output/public/` containing `index.html` plus hashed `assets/`.

### 2. Remove server-only bits from the root route
`src/routes/__root.tsx` currently uses `shellComponent` + `<Scripts />` + `HeadContent` (SSR shell). For SPA, replace the shell with a normal `RootComponent` that just renders `<Outlet />` inside `QueryClientProvider`. Move `<title>`, viewport, and CSS link into `index.html` (Vite injects the built CSS/JS automatically).

### 3. Add Capacitor config pointing at the static output
`capacitor.config.ts`:

```ts
import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'app.lovable.yourapp',
  appName: 'YourApp',
  webDir: '.output/public',      // <-- the static build folder
  // do NOT set server.url — that's what was forcing localhost
};
export default config;
```

If you previously had `server: { url: 'http://192.168.x.x:...', cleartext: true }` in the config, delete it. That setting is what makes the APK try to reach your PC's dev server.

### 4. New build + package flow
```
npm install
npm run build              # produces .output/public/
npx cap sync android       # copies .output/public into android/app/src/main/assets/public
cd android && ./gradlew assembleRelease   # or use Android Studio to sign
```
Verify before packaging: open `.output/public/index.html` via a tiny local static server (`npx serve .output/public`) — it must render correctly with Wi‑Fi off. If that works, the APK will too.

### 5. Font paths
Your app loads fonts from `/public/fonts/...`. Capacitor serves `webDir` from the app's `file:///android_asset/public/` root, so absolute `/fonts/...` URLs still resolve correctly — no change needed. Just confirm fonts are referenced with leading `/`.

## Out of scope
- No design or feature changes.
- No backend / Lovable Cloud changes (none needed; app is fully client-side).
- Android signing keystore stays as you already set it up.

## Deliverables after implementation
- Updated `vite.config.ts`, `src/routes/__root.tsx`, new `capacitor.config.ts`.
- `npm run build` produces a working static `.output/public/` you can open offline.
- Short README note with the exact `cap sync` + gradle commands.
