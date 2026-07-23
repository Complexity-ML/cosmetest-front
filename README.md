# Cosmetest — frontend

Interface web React de Cosmetest. Elle couvre la gestion des volontaires, études, groupes, rendez-vous, annulations, indemnités, paiements, rapports, paramètres et journaux selon les droits de l'utilisateur connecté.

Le backend associé se trouve dans le dépôt [`Complexity-ML/cosmetest-back`](https://github.com/Complexity-ML/cosmetest-back).

## Stack technique

| Composant | Version ou implémentation |
|---|---|
| React / React DOM | 18.2 |
| TypeScript | 5.9 |
| Vite | 5 |
| React Router | 6.22 |
| API HTTP | Axios |
| Styles | Tailwind CSS 3, Radix UI |
| Formulaires | React Hook Form |
| Internationalisation | i18next / react-i18next |
| Exports | SheetJS `xlsx`, React CSV |
| Tests | Vitest 4, Testing Library |
| Qualité | ESLint 8 |

## Prérequis

- Node.js 20 ou plus récent ;
- npm ;
- le backend Cosmetest disponible pour les parcours métier.

## Installation

```bash
git clone https://github.com/Complexity-ML/cosmetest-front.git
cd cosmetest-front
npm ci
```

`npm ci` utilise le `package-lock.json` versionné et garantit une installation reproductible.

## Environnements et URL d'API

Une seule variable frontend est nécessaire :

```dotenv
VITE_API_URL=
```

Elle contient l'origine du backend, avec ou sans suffixe `/api`. Le code normalise automatiquement l'URL.

| Mode | Configuration actuelle | Résultat |
|---|---|---|
| Développement | `VITE_API_URL` vide | requêtes relatives vers `/api`, proxifiées par Vite |
| Proxy Vite | `vite.config.ts` | `http://127.0.0.1:8888` |
| Production | `.env.production` | `http://192.168.127.36:8888` |

Le serveur de développement écoute uniquement sur :

```text
http://127.0.0.1:3000
```

> Les variables `VITE_*` sont intégrées au JavaScript lors du build et sont visibles par le navigateur. N'y placez jamais de mot de passe, JWT, cookie, clé API ou chaîne de connexion.

Après toute modification d'un fichier `.env*`, redémarrez Vite. Après toute modification de l'URL de production, reconstruisez entièrement `dist/`.

## Développement local

1. Démarrez le backend sur `127.0.0.1:8888`.
2. Lancez le frontend :

```bash
npm run dev
```

3. Ouvrez :

```text
http://127.0.0.1:3000
```

Les appels `/api/**` restent same-origin côté navigateur et Vite les transmet au backend local. Axios utilise `withCredentials: true` afin d'envoyer le cookie JWT HttpOnly.

Points de contrôle utiles :

```text
Frontend                 http://127.0.0.1:3000
Santé via le proxy       http://127.0.0.1:3000/api/health
Validation sans session http://127.0.0.1:3000/api/auth/validate
```

Sans session, `/api/auth/validate` doit répondre `401`. Un `403` indique un utilisateur authentifié sans le droit demandé ; il ne doit pas être traité comme une session expirée.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur Vite local sur `127.0.0.1:3000` |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | prévisualisation locale de `dist/` |
| `npm run lint` | ESLint avec zéro avertissement autorisé |
| `npm run test -- --run` | suite Vitest en exécution unique |
| `npm run test` | Vitest en mode interactif/watch |
| `npm run test:ui` | interface Vitest |
| `npm run test:coverage` | prévu pour la couverture Vitest, mais actuellement bloqué par l'absence de `@vitest/coverage-v8` |
| `npx tsc -b` | contrôle TypeScript complet |

Validation complète avant publication :

```bash
git diff --check
npx tsc -b
npm run lint
npm run test -- --run
npm run build
```

Le build peut signaler qu'un chunk dépasse 500 kB. Cet avertissement n'empêche pas la génération de `dist/`, mais indique un chantier de découpage/lazy loading à poursuivre.

`npm run build` exécute uniquement Vite : il ne remplace pas `npx tsc -b`. Conservez les deux commandes dans la validation. N'utilisez pas `test:coverage` comme contrôle obligatoire tant que le provider de couverture n'est pas ajouté au projet.

## Fonctionnalités principales

- authentification et restauration de session par cookie HttpOnly ;
- tableau de bord et notifications ;
- gestion des volontaires et de leurs informations détaillées ;
- études, groupes, affectations et critères ;
- calendrier, création en lot et affectation des rendez-vous ;
- annulations et remplacement contrôlé ;
- indemnités et paiements ;
- rapports et exports Excel/CSV ;
- photos, paramètres, comptes et journaux d'administration ;
- interface bilingue français/anglais sur les écrans localisés.

Politique d'accès : toutes les fonctions métier sont destinées aux utilisateurs authentifiés. La création de compte et les journaux d'audit/connexion restent réservés aux administrateurs ; le backend demeure la source d'autorité pour ces contrôles.

## Architecture

```text
src/
├── components/   composants métier et composants UI partagés
├── context/      authentification et notifications
├── hooks/        logique React réutilisable
├── i18n/         configuration et contrôle de parité des traductions
├── locales/      catalogues français et anglais
├── pages/        pages routées
├── services/     contrats et appels API Axios
├── tests/        configuration de test partagée
├── types/        types métier et API
└── utils/        formatage, dates et règles partagées
```

Les alias Vite disponibles sont :

```text
@           → src
@components → src/components
@services   → src/services
@utils      → src/utils
@hooks      → src/hooks
@context    → src/context
```

## Authentification

Le frontend n'enregistre pas le JWT dans un fichier de configuration. Le parcours web principal repose sur le cookie HttpOnly fourni par le backend :

```text
POST /api/auth/login
GET  /api/auth/validate
GET  /api/users/me
POST /api/auth/logout
```

Les informations utilisateur nécessaires à l'interface sont conservées en mémoire et normalisées pour prendre en charge les anciens et nouveaux formats de rôles.

## Build et déploiement

Créez le build de production :

```bash
npm ci
npx tsc -b
npm run lint
npm run test -- --run
npm run build
```

Le dossier à publier est :

```text
dist/
```

Procédure recommandée sur le serveur web :

1. vérifier que `.env.production` cible l'API attendue ;
2. construire `dist/` ;
3. transférer le dossier dans un emplacement temporaire ;
4. sauvegarder le dossier frontend actuellement publié ;
5. remplacer **tout** le contenu publié par le nouveau `dist/` ;
6. ne pas fusionner partiellement les anciens et nouveaux fichiers `assets/`, dont les noms sont hashés ;
7. configurer le serveur web pour renvoyer les routes SPA vers `index.html` ;
8. ouvrir l'application avec un rechargement complet (`Ctrl+F5`) ;
9. vérifier la connexion et les parcours métier prioritaires.

Vite utilise actuellement la base `/` et React Router n'a pas de `basename`. Le déploiement est donc prévu à la racine du site. L'API de production est en HTTP ; servir le frontend en HTTPS provoquerait du contenu mixte tant que le backend ne dispose pas lui aussi d'une terminaison HTTPS.

Pour revenir en arrière, restaurez le dossier frontend sauvegardé. Le frontend doit rester compatible avec la version de backend remise en service.

## Recette après déploiement

Vérifiez au minimum :

1. chargement de la page de connexion ;
2. connexion puis validation de session ;
3. ouverture des études, groupes, volontaires et rendez-vous ;
4. consultation des indemnités et paiements ;
5. export d'un rapport représentatif ;
6. absence d'erreur inattendue dans la console et l'onglet Réseau ;
7. déconnexion puis réponse `401` de `/api/auth/validate`.

## Dépannage

### Le frontend appelle encore une ancienne API

- vérifiez `.env.production` ;
- reconstruisez avec `npm run build` ;
- remplacez tout `dist/` ;
- videz le cache ou utilisez `Ctrl+F5`.

### Le développement local appelle directement le serveur de production

- laissez `VITE_API_URL` vide dans `.env.development` ;
- redémarrez Vite ;
- vérifiez le proxy de `vite.config.ts` vers `127.0.0.1:8888`.

### Erreur `401`

La session est absente ou expirée. Reconnectez-vous et vérifiez que les cookies sont acceptés. Un `401` sur `/api/auth/validate` avant connexion est attendu.

### Erreur CORS ou cookie absent

- vérifiez que l'origine du frontend est autorisée par le backend ;
- vérifiez que la requête utilise bien `withCredentials` ;
- vérifiez la cohérence HTTP/HTTPS et les attributs `Secure`/`SameSite` du cookie.

## Docker et intégration continue

Ce dépôt ne contient actuellement ni `Dockerfile`, ni fichier Compose, ni workflow CI versionné. Le livrable de production est le dossier statique `dist/`.

## Règles de contribution

- ne jamais ajouter de secret dans un fichier Vite ;
- conserver le comportement et les visuels existants lors d'une correction ciblée ;
- ajouter ou adapter les tests pour les changements fonctionnels ;
- exécuter TypeScript, ESLint, Vitest et le build avant publication ;
- ne pas commiter `node_modules/` ni `dist/`.