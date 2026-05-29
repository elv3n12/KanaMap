# Production deploy (GitHub Actions → Hostinger)

Production runs on Hostinger VPS **1339684**, Docker Compose project **`kanamap`**, image `ghcr.io/elv3n12/kanamap`.

## Secrets required

| Secret | Purpose | Required |
|--------|---------|----------|
| `HOSTINGER_API_TOKEN` | Trigger deploy via Hostinger API | Yes |
| `VPS_SSH_PRIVATE_KEY` | Prune old images + pin SHA tag | Optional (recommended) |

### HOSTINGER_API_TOKEN

1. Open [Hostinger API](https://developers.hostinger.com/) → create an API token (VPS / Docker permissions).
2. In GitHub: **elv3n12/KanaMap** → **Settings** → **Secrets and variables** → **Actions**
3. Open the **Secrets** tab (not **Variables**).
4. Under **Repository secrets**, click **New repository secret**.
5. Name: `HOSTINGER_API_TOKEN` (exact spelling, case-sensitive).

### VPS_SSH_PRIVATE_KEY (optional but recommended)

Without this secret, the workflow cannot:
- Prune old KanaMap images before pulling the new one (disk fills up over time)
- Pin the exact commit SHA tag in the VPS `.env`

To enable SSH:

1. Generate an SSH key pair (or use an existing one):
   ```bash
   ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/kanamap_deploy
   ```
2. Copy the **public** key to the VPS:
   ```bash
   ssh-copy-id -i ~/.ssh/kanamap_deploy.pub root@217.65.144.105
   ```
3. Add the **private** key as a GitHub secret:
   - Name: `VPS_SSH_PRIVATE_KEY`
   - Value: contents of `~/.ssh/kanamap_deploy`

## What happens on `git push` to `main`

1. **build-and-push** — builds the app image and pushes `latest` + commit SHA to GHCR.
2. **deploy**:
   - (if SSH configured) Prune old `ghcr.io/elv3n12/kanamap` images on VPS, set `KANAMAP_IMAGE_TAG` to exact SHA.
   - Call Hostinger API to pull and recreate containers.
   - Wait for `kanamap-web-1` to be running.
   - (if SSH configured) Prune dangling images.

This removes the race where a manual deploy pulls an old `:latest` before the new image exists.

## Manual redeploy

**Actions** → **Build & Push Docker Image** → **Run workflow** (branch `main`).

Re-runs build + deploy without a new commit.

## Verify live version

After deploy, check the workflow log for the `kanamap-web-1` container status, or on the VPS:

```bash
docker ps --filter name=kanamap-web
docker inspect kanamap-web-1 --format '{{.Image}}'
docker images ghcr.io/elv3n12/kanamap
```

---

## Disk usage and cleanup

### Why disk fills up

Each deploy pulls a new Docker image (~500MB–1GB). Old images stay on disk unless pruned. After many deploys, this can consume several GB.

### Check disk usage on VPS

```bash
df -h
docker system df
docker images ghcr.io/elv3n12/kanamap
```

### Manual one-time cleanup

SSH to the VPS and run the prune script from the repo:

```bash
ssh root@217.65.144.105

# Option A: run the script directly
bash /docker/kanamap/scripts/vps-prune-kanamap-images.sh

# Option B: manual commands
# List kanamap images
docker images ghcr.io/elv3n12/kanamap

# Remove all except currently running
docker rmi $(docker images ghcr.io/elv3n12/kanamap -q | grep -v $(docker inspect kanamap-web-1 --format '{{.Image}}' | cut -c8-19))

# Clean dangling layers
docker image prune -f
```

### Automatic prune

If `VPS_SSH_PRIVATE_KEY` is configured, every deploy automatically prunes old KanaMap images before pulling the new one. Without SSH, add a weekly cron on the VPS:

```bash
crontab -e
# Add:
0 3 * * 0 /docker/kanamap/scripts/vps-prune-kanamap-images.sh >> /var/log/kanamap-prune.log 2>&1
```

---

## One-time VPS sync (after changing compose)

The compose file on Hostinger (`/docker/kanamap/docker-compose.yml`) must be synced when:
- Adding `KANAMAP_IMAGE_TAG` variable to the image line
- Adding logging rotation config

**Option A:** Update via Hostinger hPanel (VPS → Docker → kanamap → Edit compose).

**Option B:** SSH and replace:

```bash
ssh root@217.65.144.105
cat > /docker/kanamap/docker-compose.yml << 'EOF'
# Paste contents of docker-compose.prod.yml from the repo
EOF
```

Then restart:
```bash
cd /docker/kanamap && docker compose up -d
```

---

## Important: other projects on this VPS

The VPS also runs **n8n** and **bentopdf**. The prune script and workflow only touch `ghcr.io/elv3n12/kanamap` images. Never run:
- `docker image prune -a` (removes all unused images including n8n/bento)
- `docker system prune -a` (removes volumes too)

---

## Troubleshooting

| Symptom | Likely cause |
|--------|----------------|
| Site unchanged after push | Deploy job skipped or failed; check Actions tab |
| `401` on deploy step | Invalid or missing `HOSTINGER_API_TOKEN` |
| Build OK, deploy fails | Hostinger API outage; re-run workflow |
| Old UI after successful deploy | Browser cache — hard refresh (Cmd+Shift+R) |
| Disk full on VPS | Old images not pruned; add `VPS_SSH_PRIVATE_KEY` or run manual cleanup |
| Warning "VPS_SSH_PRIVATE_KEY not set" | SSH secret missing; prune skipped (deploy still works) |
