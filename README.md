# Gun Hero

A tiny installable merge-battler: merge weapon parts on a grid to power up
your cat, who auto-fights endless waves of enemies. Built to run entirely in
the browser and install straight to your phone's home screen — no app store,
no server, no account.

## How to play

- Buy parts from the shop bar with coins earned from kills.
- Drag a part onto another of the **same type and tier** to merge it into a
  stronger version. Drag onto an empty cell to move it, or onto a different
  part to swap positions.
- Every part placed on the grid fights automatically. Mix ranged, melee, and
  splash weapons, and toss in a medkit to heal over time.
- Survive as many waves as you can. Your best wave is saved on this device.

## Development

```bash
bun install
bun run dev
```

## Deploy to GitHub Pages (install on your phone)

1. Push this repo to GitHub.
2. In the repo settings, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The included workflow at `.github/workflows/deploy.yml` builds the static site and deploys it.
4. Open the deployed URL on your phone and use "Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome) — the game is a PWA and works offline once installed.

The workflow auto-computes the base path:

- Project site (`https://<user>.github.io/<repo>/`) → base is `/<repo>/`
- User/org site (`<user>.github.io` repo) → base is `/`

For a custom domain, add a `CNAME` file to `public/` with your domain, and the base will still work (default `/`) when the repo is named `<user>.github.io`. If you use a custom domain on a project repo, set `BASE_PATH=/` manually in the workflow env.

## Project layout

- `src/game/` — engine (simulation + canvas rendering), part definitions, persistence
- `src/components/game/` — React UI (merge grid, HUD, shop, canvas wrapper)
- `src/routes/index.tsx` — the single game route
- `src/legacy-pdf-merger/` — the original PDF-merging app this repo used to be, kept for reference
- `scripts/gen-icons.mjs` — regenerates the PWA icons in `public/icons/`
