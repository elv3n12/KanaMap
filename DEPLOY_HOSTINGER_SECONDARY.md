# Deploy on Hostinger Without Touching n8n

This deployment runs the observatory in a separate Docker Compose project on port `8080`.

It does not use ports `80` or `443`, so it should not conflict with an existing n8n setup.

The app will be available at:

```text
http://srv1339684.hstgr.cloud:8080
```

## 1. Connect to the VPS

```bash
ssh root@217.65.144.105
```

## 2. Install Docker tools if needed

```bash
apt update
apt install -y git docker.io docker-compose-plugin
systemctl enable --now docker
```

## 3. Get the code

Replace the GitHub URL with the real repository URL.

```bash
git clone YOUR_GITHUB_REPO_URL cannabinoid-observatory
cd cannabinoid-observatory
```

If the repo is already cloned:

```bash
cd cannabinoid-observatory
git pull
```

## 4. Create the environment file

```bash
cp .env.secondary.example .env
nano .env
```

Change at least:

```env
AUTH_SECRET=...
MYSQL_PASSWORD=...
MYSQL_ROOT_PASSWORD=...
DATABASE_URL=mysql://kanamap:THE_SAME_MYSQL_PASSWORD@mysql:3306/kanamap
IP_HASH_SALT=...
TOKEN_HASH_SECRET=...
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM="Cannabinoid Observatory Europe <your-email>"
ADMIN_EMAIL=your-email
SEED_ADMIN_EMAIL=your-email
SEED_ADMIN_PASSWORD=...
NOMINATIM_EMAIL=your-email
```

Generate secrets with:

```bash
openssl rand -base64 32
```

## 5. Start the app

```bash
docker compose -p cannabinoid-observatory -f docker-compose.secondary.yml up -d --build
```

## 6. Seed the database

```bash
docker compose -p cannabinoid-observatory -f docker-compose.secondary.yml exec web npm run db:seed
```

## 7. Open the site

```text
http://srv1339684.hstgr.cloud:8080
```

## Useful commands

See running containers:

```bash
docker compose -p cannabinoid-observatory -f docker-compose.secondary.yml ps
```

Read logs:

```bash
docker compose -p cannabinoid-observatory -f docker-compose.secondary.yml logs -f web
```

Stop only this app:

```bash
docker compose -p cannabinoid-observatory -f docker-compose.secondary.yml down
```

This does not stop n8n.
