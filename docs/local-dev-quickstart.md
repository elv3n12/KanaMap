# Local dev quickstart

## Browser errors on `/map`?

Usually missing env vars. `apps/web/.env.local` must include at least:

- `AUTH_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_MAPTILER_KEY`

## Start database + app

From repo root:

```bash
cp .env.example .env
docker compose up -d mysql
cd apps/web
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000/map

## VPS looks empty (`ls` shows nothing)?

You may be logged in as `vince` while the app runs as `root` or in Docker:

```bash
sudo ls -la /root
docker ps
sudo find / -maxdepth 4 -name "docker-compose*.yml" 2>/dev/null
```

Clone if never deployed:

```bash
git clone https://github.com/elv3n12/KanaMap.git cannabinoid-observatory
cd cannabinoid-observatory
cp .env.secondary.example .env
# edit .env, then:
docker compose -p cannabinoid-observatory -f docker-compose.secondary.yml up -d --build
```
