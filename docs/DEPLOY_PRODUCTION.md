# Production deploy (GitHub Actions → Hostinger)

Production runs on Hostinger VPS **1339684**, Docker Compose project **`kanamap`**, image `ghcr.io/elv3n12/kanamap:latest`.

## One-time setup: Hostinger API token

1. Open [Hostinger API](https://developers.hostinger.com/) → create an API token (VPS / Docker permissions).
2. In GitHub: **elv3n12/KanaMap** → **Settings** → **Secrets and variables** → **Actions**
3. Open the **Secrets** tab (not **Variables**).
4. Under **Repository secrets**, click **New repository secret**.
5. Name: `HOSTINGER_API_TOKEN` (exact spelling, case-sensitive).  
   Value: paste the token from step 1.

**Common mistake:** adding the token under **Variables** instead of **Secrets**. Variables are visible in logs; the workflow only reads secrets (and falls back to a variable only if you used that tab by mistake).

If the deploy job fails with “HOSTINGER_API_TOKEN is empty”, delete and re-create the entry under **Repository secrets**, then **Actions → Build & Push Docker Image → Re-run all jobs**.

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
