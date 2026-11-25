# ESGI.lnk

ESGI.lnk transforme une URL longue en lien court, redirige et compte les clics.

## API

| Méthode | Route | Rôle |
| --- | --- | --- |
| `POST` | `/links` | Crée un lien. Corps : `{ "url": "https://…", "expiresInDays"?: number }`. Répond `201` avec `{ code, shortUrl, expiresAt }`. |
| `GET` | `/r/:code` | Redirige (`302`) vers l'URL d'origine et incrémente le compteur. `404` si inconnu, `410` si expiré. |
| `GET` | `/links/:code/stats` | `{ url, clicks, createdAt, expiresAt }`. Protégé par l'en-tête `Authorization: Bearer <ADMIN_TOKEN>`. |
| `GET` | `/health` | `{ status: "ok", version, db: "up" }`. |

## Règles métier

- seules les URL `http:` et `https:` sont acceptées (refus de `javascript:`, `data:`, `file:`) ;
- un code fait 6 caractères alphanumériques, généré aléatoirement, unique ;
- un lien expire après `expiresInDays` (défaut : 30 jours) ;
- on refuse de raccourcir une URL qui pointe vers le domaine d'ESGI.lnk lui-même (boucle de redirection) ;
- chaque redirection incrémente le compteur de clics du lien.

## Démarrer en local

Node.js : la version de `.nvmrc`.

```bash
docker compose up -d        # PostgreSQL local
npm ci
export DATABASE_URL=postgres://esgilnk:esgilnk@localhost:5432/esgilnk
export ADMIN_TOKEN=dev-admin-token
npm run build
npm start                   # http://localhost:3000
```

Variables d'environnement :

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL | obligatoire |
| `ADMIN_TOKEN` | Token de la route `stats` | obligatoire |
| `PUBLIC_BASE_URL` | Préfixe des liens courts, et domaine refusé en entrée | `http://localhost:3000` |
| `APP_VERSION` | Valeur renvoyée par `/health` | `dev` |
| `PORT` | Port d'écoute | `3000` |

## Scripts

| Script | Rôle |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Tests unitaires (sans base) |
| `npm run test:integration` | Tests d'intégration (exige `DATABASE_URL`) |
| `npm test` | Les deux |
| `npm run test:coverage` | Tests avec couverture, rapport dans `coverage/` (exige `DATABASE_URL`) |
| `npm run build` | Compile vers `dist/` |
| `npm start` | Lance `dist/server.js` |

## Image Docker

```bash
docker build --build-arg APP_VERSION=$(git rev-parse HEAD) -t esgi-lnk .
docker run -p 3000:3000 -e DATABASE_URL=… -e ADMIN_TOKEN=… esgi-lnk
```
