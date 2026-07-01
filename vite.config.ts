// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Base path for GitHub Pages. For a project site (https://<user>.github.io/<repo>/),
// set BASE_PATH=/<repo>/ in the deploy workflow. For a custom domain or user/org
// root site, leave it unset (defaults to "/").
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    base,
  },
  nitro: {
    preset: "static",
    prerender: {
      routes: ["/"],
      crawlLinks: true,
      failOnError: false,
    },
  } as any,
});
