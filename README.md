# Cannabinoid Observatory Europe

Observatoire Européen des Cannabinoïdes Émergents.

Cette plateforme ne référence pas des points de vente pour faciliter l’achat. Elle documente des signalements publics afin de rendre visible la circulation de cannabinoïdes psychoactifs émergents, leurs formes commerciales, leurs risques rapportés et les défaillances de contrôle du marché.

## Stack

- Next.js + TypeScript + Tailwind
- Leaflet + OpenStreetMap
- Prisma + MySQL
- Auth.js credentials email/password
- Nodemailer SMTP Hostinger
- Docker Compose + Caddy HTTPS
- Worker quotidien de résumé modération

## Limites du MVP

- Les signalements ne sont pas publiés automatiquement.
- La carte publique affiche des zones approximatives, jamais des adresses exactes.
- Les prix observés peuvent être conservés comme données statistiques, mais ne sont pas mis en avant dans l’interface publique.
- Les exports institutionnels avancés, fiches produits détaillées et droit de réponse complet sont prévus pour MVP 2.

## Modèle de données

Le modèle principal repose sur :

- `User` avec rôles `USER`, `VERIFIED_CONTRIBUTOR`, `MODERATOR`, `ADMIN`, `VERIFIED_INSTITUTION`.
- `Report` pour les signalements modérés.
- `Location` pour les zones approximatives.
- `Product`, `Brand`, `Molecule`, `MarketingClaim`, `AdverseEffect`.
- `Evidence` pour les preuves uploadées après retrait des métadonnées.
- `AdverseEffectDeclaration` pour les déclarations d’effets indésirables.
- `ModerationAction` et `AuditLog` pour historiser les actions sensibles.

## Politique d’anonymisation

- Les IP sont hashées avec un sel privé.
- Les emails et téléphones sont masqués dans les champs publics.
- Les images sont réencodées via `sharp` pour retirer les métadonnées EXIF.
- Les marchés informels ne conservent pas d’adresse exacte même si un utilisateur en soumet une.
- Les API publiques ne retournent jamais `exactLat`, `exactLng` ou `exactAddress`.

## Modération

Voir [docs/moderation-policy.md](docs/moderation-policy.md).

Statuts principaux : `PENDING_REVIEW`, `PUBLISHED_LIMITED`, `PUBLISHED`, `REJECTED`, `ARCHIVED`, `CONTESTED`.

Voir aussi [docs/proof-levels.md](docs/proof-levels.md) pour les niveaux de preuve.

## Développement local

```bash
cp .env.example .env
docker compose up -d mysql
cd apps/web
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Tests critiques :

```bash
cd apps/web
npm run test
```

## Déploiement VPS Hostinger

1. Pointer le DNS du domaine vers l'IP du VPS.
2. Installer Docker et Docker Compose.
3. Copier `.env.example` vers `.env`, puis renseigner les secrets, SMTP et domaine.
4. Définir `APP_DOMAIN` dans `.env` si le domaine n'est pas `localhost`.
5. Lancer :

```bash
docker compose up -d --build
docker compose exec web npm run db:seed
```

## Sauvegardes MySQL

Le volume MySQL est persistant. Pour une sauvegarde manuelle :

```bash
docker compose exec mysql sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" > /backups/kanamap-$(date +%F).sql'
```

Planifier cette commande via `crontab` sur le VPS pour une sauvegarde quotidienne.
