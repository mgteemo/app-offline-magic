# Building the offline Android APK with Capacitor

This project is configured as a **static SPA** so it can be packaged into a
Capacitor APK and work fully offline — no Wi-Fi, no localhost, no server.

## Why the previous APK needed Wi-Fi

TanStack Start is SSR-first. A default `vite build` produces a Node/Nitro
server bundle under `.output/server/` and only assets (no usable
`index.html`) under `.output/public/`. If Capacitor's `capacitor.config.ts`
has `server.url` pointing at your PC, the installed app loads from there —
which only works while your phone can reach your PC.

The fix:

1. `vite.config.ts` enables `spa` + per-page `prerender` so the build emits
   a real static site (HTML + hashed JS/CSS) under `.output/public/`.
2. `capacitor.config.ts` sets `webDir: ".output/public"` and **omits**
   `server.url` entirely.

## Build + package

```bash
npm install
npm run build                       # -> .output/public/ (static site)

# Verify offline first — turn Wi-Fi off, then:
npx serve .output/public            # open the printed URL; app must work

# Sync the static build into the native Android project:
npx cap sync android

# Build / sign in Android Studio, or from the CLI:
cd android
./gradlew assembleRelease           # unsigned-release APK in app/build/outputs/apk/release/
```

If you've never added Android yet:

```bash
npm install -D @capacitor/cli
npm install @capacitor/core @capacitor/android
npx cap add android
```

## Common pitfalls

- **White screen in APK** → `webDir` points at the wrong folder, or
  `server.url` is still set in `capacitor.config.ts`. Remove the `server`
  block, re-run `npm run build && npx cap sync android`.
- **"Cannot reach localhost"** → leftover `server.url`. Same fix as above.
- **Fonts/images missing** → reference them with a leading slash
  (`/fonts/...`, `/logo.png`). Capacitor serves `webDir` from the asset
  root, so absolute paths resolve correctly.
- **Routing 404 on refresh inside the APK** → only matters if you add more
  routes; add each route to the `pages` array in `vite.config.ts` so it
  gets prerendered.
