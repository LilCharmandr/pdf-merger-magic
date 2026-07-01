## Goal
Make the app build and deploy reliably on GitHub Pages.

## What I’ll change
1. **Stop using the TanStack/Nitro SSR build for GitHub Pages**
   - The current error happens because GitHub Pages is static hosting, while `vite build` is still trying to run the SSR/Nitro build pipeline.
   - I’ll add a separate Pages build that uses Vite as a client-only static build.

2. **Add a GitHub Pages-specific Vite config**
   - Keep the normal Lovable/TanStack config intact for preview/development.
   - Add a separate config for GitHub Pages that outputs static files to `dist` and respects `BASE_PATH`.

3. **Add a GitHub Pages entry file**
   - Mount the existing React app in browser-only mode for Pages.
   - Avoid SSR/prerender so the PDF combiner works as a static client app.

4. **Update the workflow**
   - Change the Build step from `bun run build` to the new Pages build script.
   - Keep `404.html` fallback and `.nojekyll` so refreshes and deep links work.

5. **Keep current app behavior unchanged**
   - No UI/feature changes.
   - The app will still merge files fully in the browser.

## Technical details
- Add a script like `build:pages` to `package.json`.
- Add a dedicated `vite.pages.config.ts` using React, path aliases, Tailwind, and `base: process.env.BASE_PATH ?? "/"`.
- Add a small browser-only entry that renders the existing route tree with TanStack Router.
- Update `.github/workflows/deploy.yml` to run `bun run build:pages` and upload `dist`.

## Expected result
The GitHub Actions build should stop hitting the SSR error:

```text
rollupOptions.input should not be an html file when building for SSR
```

and GitHub Pages should publish the static PDF combiner successfully.