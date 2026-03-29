# Samsic Accueil — Instructions Agent Antigravity

> **LIRE CE FICHIER EN PREMIER avant tout travail sur ce projet.**

## Contexte

Tu développes **Samsic Accueil** pour A&A Digital Factory.  
C'est une plateforme SaaS de gestion intelligente des plannings d'accueil  
pour **SAMSIC Facility (Luxembourg)**.  
→ **44 employés** | **17 clients** | **~35 postes/jour**

---

## Documentation Obligatoire

Avant de coder, TOUJOURS consulter dans `/docs/` (ou à la racine) :

| Fichier | Contenu |
|---------|---------|
| `05-ARCHITECTURE.md` | Stack et structure monorepo |
| `03-DATA-MODEL.md` | Schéma Prisma complet |
| `04-AI-ENGINE.md` | Moteur IA scoring 8 critères |
| `14-AI-ENGINE-DEEP-DIVE.md` | IA apprentissage et feedback |
| `06-API-SPEC.md` | Endpoints REST |
| `07-DASHBOARD.md` | Widgets et KPIs |
| `08-EMAIL-FLOWS.md` | 15 flux email |
| `09-DESIGN-SYSTEM.md` | Charte graphique SAMSIC |
| `15-REAL-DATA-ANALYSIS.md` | Données réelles SAMSIC |
| `16-ANTIGRAVITY-GUIDE.md` | Skills, roadmaps, conventions |

---

## Skills Obligatoires par Tâche

### 🎨 Frontend / UI
```
@samsic-design-system   ← TOUJOURS en premier pour tout composant UI
@frontend-design        ← Direction artistique Bold Geometric
@react-patterns         ← Hooks, composition, Server/Client
@nextjs-best-practices  ← App Router, Server Components
@tailwind-patterns      ← Utilitaires Tailwind
@web-design-guidelines  ← UX patterns, accessibilité
```

### 📋 Planning Matriciel
```
@samsic-planning-grid   ← Grille clients×jours, codes couleur
@react-patterns         ← Composants interactifs
@frontend-design        ← Mode simulation, animations
```

### 🤖 Moteur IA
```
@samsic-ai-scoring      ← 8 critères, cascade solver, learning engine
@test-driven-development ← OBLIGATOIRE avant toute ligne d'implémentation
@testing-patterns       ← Tests unitaires, edge cases
@debugging-strategies   ← Debug du scoring
```

### 🗄️ Base de Données
```
@samsic-data-model      ← Schéma Prisma, requêtes fréquentes
@postgres-best-practices ← Configuration, indexation
@database-design        ← Modèle de données, migrations
```

### ⚙️ Backend / API
```
@api-patterns           ← REST conventions, pagination
@security-auditor       ← Auth JWT, RBAC, OWASP
```

### 🧪 Tests & Qualité
```
@test-driven-development ← TDD — JAMAIS de code sans test d'abord
@testing-patterns       ← Stratégie de test
@lint-and-validate      ← APRÈS chaque modification de code
```

### 🚀 Déploiement
```
@vercel-deployment      ← Prototype staging
@concise-planning       ← Planification sprint
```

### 📝 Planification
```
@writing-plans          ← Plans d'implémentation structurés
@samsic-demo-scenario   ← Scénario démo lundi
```

---

## Conventions de Code

```
Code source    → ANGLAIS (variables, fonctions, commentaires)
Interface UI   → FRANÇAIS (labels, boutons, messages)
Commits        → Conventional Commits : feat: fix: docs: chore:
Tests IA       → > 80% coverage obligatoire
Logs           → Aucun console.log en production
BDD            → Prisma Client UNIQUEMENT (jamais SQL brut)
```

---

## Charte Design — Règles Absolues

```
Couleur dominante  → Marine #24303b (sidebar, titres, CTA)
Couleur fond page  → Sable-30 #ede5de
Couleur accent     → Sable #bfa894 (bordures actives)
Couleur action     → Bleu #0078b0 (liens, actions secondaires)
Typographies       → Open Sans (body) + Roboto (KPIs display)
Border-radius      → 0px PARTOUT — aucun arrondi autorisé
Gradients          → INTERDITS (pas de purple/gradient SaaS)
```

---

## Architecture Monorepo

```
apps/
├── web/          → Next.js 14 (App Router) + Tailwind + shadcn/ui
│   ├── app/      → Pages et layouts App Router
│   ├── components/ → Composants UI
│   ├── lib/ai/   → Moteur IA TypeScript (prototype)
│   └── data/     → Seed data JSON
└── api/          → NestJS + Prisma + PostgreSQL (V1)
    ├── src/ai/   → Module IA NestJS
    └── prisma/   → Schema + migrations

packages/
└── shared/       → Types TypeScript partagés
```

---

## Roadmap Prototype (Vendredi → Dimanche)

| Priorité | Écran / Feature | Skills |
|----------|----------------|--------|
| 🔴 P0 | Dashboard (KPIs + alertes) | @samsic-design-system @react-patterns |
| 🔴 P0 | Planning matriciel interactif | @samsic-planning-grid @frontend-design |
| 🔴 P0 | Moteur IA scoring 8 critères | @samsic-ai-scoring @test-driven-development |
| 🟠 P1 | Panneau suggestions IA | @react-patterns @frontend-design |
| 🟠 P1 | Mode simulation | @samsic-planning-grid |
| 🟡 P2 | Fiches employés (liste + détail) | @react-patterns |
| 🟡 P2 | Fiches clients | @react-patterns |
| 🟡 P2 | Système alertes | @react-patterns |
| 🟢 P3 | Polish animations + responsive | @frontend-design |

---

## Utilisateurs Clés

| Nom | Rôle | Accès |
|-----|------|-------|
| **Mandy De Melo** | Responsable / Admin | Tout |
| **Jessica Santos** | Opératrice Planning | Planning + Employés |
| **Paola Soares** | Team Leader | Planning (lecture) |

---

## Démo Lundi — Checklist Finale

- [ ] Consulter @samsic-demo-scenario avant le polish final
- [ ] 3 scénarios jouables sans bug
- [ ] 2 postes non couverts visibles au démarrage
- [ ] Mode simulation fonctionnel
- [ ] `npm run dev` démarre en < 5 secondes
