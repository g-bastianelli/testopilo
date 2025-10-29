# 🏡 Simulateur LMNP AI-First

> **Simulateur fiscal LMNP avec IA conversationnelle**
> Discutez naturellement avec une IA pour simuler votre fiscalité (Micro-BIC vs Régime Réel)

[![Demo Video](https://img.shields.io/badge/📹_Démo-Loom-5865F2?style=for-the-badge)](https://www.loom.com/share/48495c743a914591b6985f4d1ea8e0ce)

---

## 🚀 Démarrage rapide (3 étapes)

### 1️⃣ Installer les dépendances

```bash
pnpm install
```

### 2️⃣ Configurer la clé API

Créer un fichier `.env` à la racine :

```env
XAI_API_KEY=your-xai-api-key-here
```

### 3️⃣ Lancer l'application

```bash
pnpm dev
```

**C'est tout !** 🎉

- Frontend : http://localhost:4200
- Backend : http://localhost:3000

---

## 🎯 Qu'est-ce que c'est ?

Un simulateur fiscal LMNP où vous **discutez** avec une IA qui :

1. ✅ Extrait automatiquement vos infos (prix d'achat, loyer, charges...)
2. ✅ Calcule la fiscalité Micro-BIC vs Régime Réel
3. ✅ Recommande le meilleur choix
4. ✅ Affiche les résultats en temps réel

### Exemple de conversation

```
Vous : "J'ai acheté un appartement à 200 000€"
IA   : "Noté ! Quel est le loyer mensuel ?"
Vous : "800€ par mois"
IA   : "Parfait. Quelles sont vos charges annuelles ?"
...
→ Simulation s'affiche automatiquement dès que tout est rempli
```

---

## 💡 Points forts

- **Zéro hallucinations** : Calculs 100% TypeScript (l'IA ne calcule jamais)
- **ReAct Agent** : IA autonome avec tool calling (LangGraph)
- **Type-safe** : Validation Zod partout
- **Monorepo Nx** : Architecture professionnelle

---

## 🏗️ Architecture

```
Frontend (React)  →  Backend (Hono)  →  ReAct Agent  →  Calculs TypeScript
    :4200              :3000              LangGraph       (zéro hallucination)
```

**Stack** :

- Backend : Hono + LangChain + xAI (Grok)
- Frontend : React + Vite + TanStack Router
- Shared : Zod schemas + calculations

---

## 🛠️ Commandes utiles

```bash
pnpm dev          # Lance tout (backend + frontend)
pnpm build        # Build de production
nx test           # Tests unitaires
nx lint           # Linting
```

---

## 🐛 Problèmes courants

**Frontend ne se connecte pas** → Vérifier `.env` : `XAI_API_KEY=...`

**Calculs ne s'affichent pas** → 5 champs requis : prix, loyer, charges, durée, TMI

**Erreur de build** → `nx reset && pnpm install`

---

## 📝 Licence

MIT
