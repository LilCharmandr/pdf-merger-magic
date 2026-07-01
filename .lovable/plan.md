## Goal
Deploy the PDF Combiner to GitHub Pages as a static site.

## Context
The project is fully client-side (no server functions, no DB). But it's built on TanStack Start with the Nitro/Cloudflare SSR preset. GitHub Pages only serves static files, so we need a prerendered/SPA build and a Pages workflow.

## Approach

**1. Switch build to a static preset**
Update `vite.config.ts` to configure Nitro with `preset: "static"` and enable prerendering of `/` so a plain `index.html` is emitted. Add a `404.html` fallback (copy of `index.html`) so client-side routes work on refresh.

**2. Base path for project pages**
GitHub Pages serves user/org sites at `https://<user>.github.io/<repo>/`. Set Vite `base: "/<repo>/"` (configurable). If the user plans to deploy to a root domain (custom domain or `<user>.github.io`), base stays `/`. I'll ask which.

**3. GitHub Actions workflow**
Add `.github/workflows/deploy.yml` that:
- runs on push to `main`
- installs with `bun install`
- runs `bun run build`
- uploads the static output dir (`dist/` or Nitro's `.output/public`) as a Pages artifact
- deploys via `actions/deploy-pages`

**4. Jekyll bypass**
Add empty `public/.nojekyll` so GitHub Pages serves files/folders starting with `_`.

**5. README note**
Short section: enable Pages → Source: GitHub Actions, then push.

## Files
- `vite.config.ts` — add `nitro.preset: "static"`, prerender routes, `vite.base`
- `.github/workflows/deploy.yml` — new
- `public/.nojekyll` — new (empty)
- `public/404.html` — generated during build step (copy of index.html), or handled in workflow
- `README.md` — brief deploy instructions

## Question before finalizing
1. What's the GitHub repo name? (needed for `base`) — or will you use a custom domain / `<user>.github.io` root?
