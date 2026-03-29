# Samsic Accueil — Plateforme IA de Planification

> **Client** : SAMSIC Facility  
> **Réf.** : AA-2026-SAMSIC-001  
> **Version** : 2.0 — Mars 2026 (post-données client)  
> **Auteur** : A&A Digital Factory

---

## Vue d'ensemble

Samsic Accueil est une plateforme SaaS de gestion intelligente des plannings d'accueil. Elle permet à SAMSIC Facility d'affecter automatiquement des hôtes/hôtesses sur les sites clients, de gérer les remplacements via un moteur IA à scoring multi-critères, et de piloter l'ensemble de l'activité depuis un dashboard temps réel.

### Périmètre V1 — Segment Facility (Accueil)
- **44 employés** (30 titulaires + 8 backups + 3 team leaders + extras)
- **17 clients actifs** (~35 postes quotidiens)
- **31 mois d'historique** planning disponibles (janv 2024 → juil 2026)
- Conçu pour scaler vers **500+ employés / 250+ clients** (segment Nettoyage)

### Opérateurs planning
- **Mandy De Melo** : Responsable (Team Leader)
- **Jessica Santos** : Assistante planning
- **Paola Soares** : Team Leader

---

## Structure de la documentation

| # | Fichier | Contenu |
|---|---------|---------|
| 00 | [00-ZONES-OMBRE.md](docs/questions/00-ZONES-OMBRE.md) | Questions ouvertes, hypothèses validées/invalidées |
| 01 | [01-USERS-ROLES.md](docs/users/01-USERS-ROLES.md) | Utilisateurs, rôles et permissions |
| 02 | [02-FEATURES-LIST.md](docs/features/02-FEATURES-LIST.md) | 86 fonctionnalités V1, dont 49 critiques |
| 03 | [03-DATA-MODEL.md](docs/data-model/03-DATA-MODEL.md) | Schéma Prisma complet PostgreSQL |
| 04 | [04-AI-ENGINE.md](docs/architecture/04-AI-ENGINE.md) | Moteur IA — Scoring 8 critères + algorithmes |
| 05 | [05-ARCHITECTURE.md](docs/architecture/05-ARCHITECTURE.md) | Architecture technique, monorepo, stack |
| 06 | [06-API-SPEC.md](docs/api/06-API-SPEC.md) | ~80 endpoints REST documentés |
| 07 | [07-DASHBOARD.md](docs/dashboard/07-DASHBOARD.md) | Dashboard opérateur, 8 widgets, KPIs |
| 08 | [08-EMAIL-FLOWS.md](docs/emails/08-EMAIL-FLOWS.md) | 15 flux d'emails, templates, RGPD |
| 09 | [09-DESIGN-SYSTEM.md](docs/design/09-DESIGN-SYSTEM.md) | Design system Bold Geometric |
| 10 | [10-SCALABILITY.md](docs/scalability/10-SCALABILITY.md) | Stratégie multi-métier Accueil → Nettoyage |
| 11 | [11-DEPLOYMENT.md](docs/deployment/11-DEPLOYMENT.md) | Docker, CI/CD, backups, monitoring |
| 12 | [12-PROTOTYPE-PLAN.md](docs/12-PROTOTYPE-PLAN.md) | Plan prototype démo lundi |
| 13 | [13-EXECUTIVE-KPI-DASHBOARD.md](docs/dashboard/13-EXECUTIVE-KPI-DASHBOARD.md) | 6 KPIs + 6 KRIs exécutifs |
| 14 | [14-AI-ENGINE-DEEP-DIVE.md](docs/architecture/14-AI-ENGINE-DEEP-DIVE.md) | IA : apprentissage, stack, monitoring, faisabilité |
| 15 | [15-REAL-DATA-ANALYSIS.md](docs/15-REAL-DATA-ANALYSIS.md) | Analyse données réelles SAMSIC + mises à jour |
| 16 | [16-ANTIGRAVITY-GUIDE.md](docs/16-ANTIGRAVITY-GUIDE.md) | 47 skills, roadmaps, questionnaires validation |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | NestJS (Node.js) + TypeScript |
| Base de données | PostgreSQL 16 + Prisma ORM |
| Moteur IA | Module NestJS dédié (scoring multi-critères, apprentissage par feedback) |
| Auth | NextAuth.js + JWT + RBAC (4 rôles) |
| Emails | Resend + React Email |
| Hébergement | Cloud européen UE (Scaleway/Hetzner) — RGPD natif |
| CI/CD | GitHub Actions |

---

## Antigravity Skills requis

```bash
# Installation
npx antigravity-awesome-skills --antigravity

# Skills critiques pour ce projet (47 sélectionnés)
# Détail complet dans docs/16-ANTIGRAVITY-GUIDE.md
```

| Domaine | Skills clés |
|---------|-------------|
| Architecture | `@architecture`, `@senior-architect`, `@api-design-principles` |
| Frontend | `@frontend-design`, `@react-patterns`, `@nextjs`, `@tailwind-css` |
| Backend | `@typescript-expert`, `@api-security-best-practices` |
| Database | `@postgres-best-practices`, `@database-patterns` |
| Sécurité | `@security-auditor`, `@owasp-top-10`, `@vulnerability-scanner` |
| Testing | `@test-driven-development`, `@testing-patterns`, `@lint-and-validate` |
| Infra | `@docker-expert`, `@ci-cd`, `@monitoring` |

---

## Démarrage rapide

```bash
git clone [repo-url]
cd samsic-accueil
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## Conventions

- **Code** : Anglais (variables, fonctions, commentaires)
- **UI** : Français (labels, messages, erreurs)
- **Documentation** : Français
- **Branching** : `main` → `develop` → `feature/*` → `fix/*`
- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Design** : Bold Geometric — rouge #D42E12, fond crème #F5F3EF, typo Outfit
