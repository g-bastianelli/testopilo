# 🚀 Lancer l'Application LMNP

Guide complet pour démarrer le simulateur LMNP avec frontend et backend.

## Prérequis

- Node.js 20.19+ ou 22.12+
- pnpm installé
- Clé API xAI (Grok) configurée

## Configuration

### 1. Variables d'environnement Backend

Créer un fichier `.env` à la racine du projet :

```env
# Backend
VERSION=0.0.1
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=your-xai-api-key-here
```

**⚠️ Important** : Remplace `your-xai-api-key-here` par ta vraie clé API xAI.

### 2. Variables d'environnement Frontend

Le fichier `.env` est déjà créé dans `apps/lmnp/frontend/.env` :

```env
VITE_API_URL=http://localhost:3000
```

## Démarrage

### Option 1 : Lancer Backend + Frontend en parallèle

```bash
# Dans un terminal, démarre le backend
nx serve lmnp-backend

# Dans un autre terminal, démarre le frontend
nx serve lmnp-frontend
```

### Option 2 : Utiliser run-many (recommandé)

```bash
# Démarre backend et frontend simultanément
nx run-many -t serve -p lmnp-backend lmnp-frontend
```

## URLs d'accès

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000
- **Health Check** : http://localhost:3000/health

## Tester l'application

### 1. Via le Frontend (Browser)

1. Ouvre http://localhost:4200 dans ton navigateur
2. Tape un message comme : `"Bonjour, j'ai acheté un appartement à 200 000€"`
3. L'IA devrait répondre et remplir automatiquement le prix d'achat
4. Continue la conversation pour remplir toutes les informations
5. Une fois toutes les infos renseignées, la simulation s'affiche automatiquement

### 2. Via Insomnia/Postman (API directe)

Utilise les payloads dans `docs/INSOMNIA_PAYLOADS.md`.

Exemple rapide :

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Bonjour, je veux simuler ma fiscalité LMNP"
      }
    ],
    "currentData": {
      "purchasePrice": null,
      "monthlyRent": null,
      "annualExpenses": null,
      "holdingPeriod": null,
      "taxRate": null
    }
  }'
```

## Architecture

```
┌─────────────────┐
│   Frontend      │  React + Vite
│  (Port 4200)    │  AI-first UI
└────────┬────────┘
         │ HTTP
         │
┌────────▼────────┐
│   Backend       │  Hono + Node.js
│  (Port 3000)    │
│                 │
│  /chat  ────────┼─► Grok AI (xAI)
│  /simulate      │
└────────┬────────┘
         │
┌────────▼────────┐
│  lmnp-shared    │  Types + Schemas + Calculations
│                 │  (Zod validation)
└─────────────────┘
```

## Fonctionnalités

### Chat AI-First

✅ **Démarrage à vide** : Toutes les valeurs sont `null` au début
✅ **Remplissage progressif** : L'IA extrait les infos au fil de la conversation
✅ **Détection automatique** : L'IA identifie les valeurs manquantes
✅ **Correction** : L'utilisateur peut corriger à tout moment

### Simulation Automatique

✅ **Temps réel** : Dès que toutes les infos sont complètes
✅ **Micro-BIC vs Régime Réel** : Comparaison côte à côte
✅ **Recommandation** : L'IA suggère le meilleur régime
✅ **Calculs fiables** : Pas d'hallucinations, tout est calculé en TypeScript

## Troubleshooting

### Le frontend ne se connecte pas au backend

1. Vérifie que le backend tourne sur le port 3000
2. Vérifie le fichier `apps/lmnp/frontend/.env`
3. Regarde les erreurs dans la console du navigateur (F12)

### L'IA ne répond pas

1. Vérifie que la clé API xAI est valide dans `.env`
2. Regarde les logs du backend pour les erreurs
3. Teste l'API directement avec curl

### Les calculs ne s'affichent pas

Les calculs ne s'affichent **que si toutes les informations requises sont renseignées** :

- Prix d'achat
- Loyer mensuel
- Charges annuelles
- Durée de détention
- Taux d'imposition (0, 11, 30, 41 ou 45)

### Erreur de build

```bash
# Nettoie et rebuild
nx reset
pnpm install
nx build lmnp-shared
nx build lmnp-backend
nx build lmnp-frontend
```

## Développement

### Structure des fichiers

```
apps/
├── lmnp/
│   ├── backend/          # API Hono
│   │   ├── src/
│   │   │   ├── routes/   # /chat, /simulate
│   │   │   ├── services/ # ai.service.ts
│   │   │   └── config/   # env.ts
│   │   └── package.json
│   └── frontend/         # React UI
│       ├── src/
│       │   ├── app/      # app.tsx
│       │   └── services/ # api.ts
│       └── package.json
libs/
└── lmnp-shared/          # Types + Calculs partagés
    ├── src/lib/
    │   ├── types.ts
    │   ├── schemas.ts
    │   └── calculations.ts
    └── package.json
```

### Hot Reload

Les deux applications supportent le hot reload :

- Modifie le code frontend → Le navigateur se recharge automatiquement
- Modifie le code backend → Le serveur redémarre automatiquement

## Production

### Build

```bash
# Build tout
nx run-many -t build -p lmnp-backend lmnp-frontend

# Build séparément
nx build lmnp-backend
nx build lmnp-frontend
```

### Déploiement

**Backend** :

```bash
cd dist/apps/lmnp/backend
node main.js
```

**Frontend** :

```bash
# Le frontend est un site statique dans dist/apps/lmnp/frontend
# Déploie sur Vercel, Netlify, ou n'importe quel hébergeur statique
```

## Améliorations futures

- [ ] Ajouter un historique des simulations
- [ ] Exporter les résultats en PDF
- [ ] Support multi-langue (EN, FR)
- [ ] Tests E2E avec Playwright
- [ ] Authentification utilisateur
- [ ] Sauvegarder les simulations en base de données

## Support

Pour toute question, consulte :

- `docs/LMNP.md` - Explication du LMNP
- `docs/PLAN_DEV.md` - Plan de développement
- `docs/INSOMNIA_PAYLOADS.md` - Exemples d'API
