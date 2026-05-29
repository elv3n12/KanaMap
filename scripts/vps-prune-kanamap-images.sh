#!/bin/bash
set -euo pipefail

# Prune old KanaMap Docker images on the VPS.
# Safe: only removes ghcr.io/elv3n12/kanamap tags, never touches n8n/bentopdf.

IMAGE_REPO="ghcr.io/elv3n12/kanamap"

echo "=== KanaMap image prune ==="
echo "Target repo: $IMAGE_REPO"

# Get image IDs currently used by kanamap containers (running or stopped)
USED_IDS=$(docker ps -a --filter "name=kanamap" --format '{{.Image}}' | \
  xargs -r -I{} docker inspect --format '{{.Id}}' {} 2>/dev/null | sort -u || true)

echo "Images in use by kanamap containers:"
echo "${USED_IDS:-  (none)}"

# Get all image IDs for the kanamap repo
ALL_KANAMAP_IDS=$(docker images "$IMAGE_REPO" --format '{{.ID}}' | sort -u || true)

echo ""
echo "All $IMAGE_REPO images on this host:"
docker images "$IMAGE_REPO" --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}' || true

# Remove images not in use
REMOVED=0
for IMG_ID in $ALL_KANAMAP_IDS; do
  if echo "$USED_IDS" | grep -q "$IMG_ID"; then
    echo "Keeping $IMG_ID (in use)"
  else
    echo "Removing $IMG_ID..."
    docker rmi -f "$IMG_ID" 2>/dev/null && REMOVED=$((REMOVED + 1)) || echo "  (already removed or failed)"
  fi
done

echo ""
echo "Removed $REMOVED old kanamap image(s)."

# Clean up dangling images (safe globally - only untagged, unreferenced layers)
echo ""
echo "Pruning dangling images..."
docker image prune -f

echo ""
echo "=== Done ==="
docker images "$IMAGE_REPO" --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}'
