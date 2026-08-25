# Legacy: PDF Combiner

This is the original app that used to live at the repo root (`src/routes/index.tsx`)
before the repo was repurposed into the **Gun Hero** merge game. It's kept here
for reference only and is not wired into any route or build.

- `components/pdf-combiner/` — drop zone, file list/row UI
- `lib/combine-pdf.ts` — client-side PDF/image merge logic (uses `pdf-lib`)

If you ever want it back, copy these into `src/components` / `src/lib` and
restore the old `src/routes/index.tsx` from git history.
