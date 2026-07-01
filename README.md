# PDF Combiner

A client-side tool to merge PDFs and images into a single PDF. Files never leave your browser and are erased when you close the tab.

## Development

```bash
bun install
bun run dev
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The included workflow at `.github/workflows/deploy.yml` builds the static site and deploys it.

The workflow auto-computes the base path:
- Project site (`https://<user>.github.io/<repo>/`) → base is `/<repo>/`
- User/org site (`<user>.github.io` repo) → base is `/`

For a custom domain, add a `CNAME` file to `public/` with your domain, and the base will still work (default `/`) when the repo is named `<user>.github.io`. If you use a custom domain on a project repo, set `BASE_PATH=/` manually in the workflow env.
