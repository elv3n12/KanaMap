# Production deploy (GitHub Actions → Hostinger)

Production runs on Hostinger VPS **1339684**, Docker Compose project **`kanamap`**, image `ghcr.io/elv3n12/kanamap:latest`.

## One-time setup: Hostinger API token

1. Open [Hostinger API](https://developers.hostinger.com/) → create an API token (VPS / Docker permissions).
2. In GitHub: **elv3n12/KanaMap** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
3. Name: `HOSTINGER_API_TOKEN`  
   Value: paste the token from step 1.

Without this secret, the **deploy** job in [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml) fails with a clear error.

## What happens on `git push` to `main`

1. **build-and-push** — builds the app image and pushes `latest` + commit SHA to GHCR.
2. **deploy** — runs only after the image push succeeds, calls Hostinger to pull and recreate containers.

This removes the race where a manual deploy pulls an old `:latest` before the new image exists.

## Manual redeploy

**Actions** → **Build & Push Docker Image** → **Run workflow** (branch `main`).

Re-runs build + deploy without a new commit.

## Verify live version

After deploy, check the workflow log for the `kanamap-web-1` container status, or on the VPS:

```bash
docker ps --filter name=kanamap-web
docker inspect kanamap-web-1 --format '{{.Image}}'
```

## Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| Site unchanged after push | Deploy job skipped or failed; check Actions tab |
| `401` on deploy step | Invalid or missing `HOSTINGER_API_TOKEN` |
| Build OK, deploy fails | Hostinger API outage; re-run workflow |
| Old UI after successful deploy | Browser cache — hard refresh (Cmd+Shift+R) |
