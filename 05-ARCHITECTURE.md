# 05 — Architecture technique globale

## Stack

| Couche | Choix | Justification |
|--------|-------|---------------|
| Frontend | Next.js 14 + TypeScript + Tailwind + shadcn/ui | SSR, App Router, composants serveur |
| Backend | NestJS (Node.js) + TypeScript | Stack unifiée TS, injection dépendances, testable |
| BDD | PostgreSQL 16 + Prisma ORM | Relations complexes, migrations versionnées |
| Moteur IA | Module NestJS dédié | <200ms pour 44 profils, pas de dépendance externe |
| Auth | NextAuth.js + JWT + RBAC | 4 rôles, sessions sécurisées |
| Emails | Resend + React Email | Templates React, tracking livraison |
| Hébergement | Cloud européen (Scaleway/Hetzner) | RGPD natif, données UE |

## Structure monorepo

```
samsic-accueil/
├── apps/
│   ├── web/                    # Frontend Next.js 14
│   │   ├── app/(auth)/         # Login, reset password
│   │   ├── app/(dashboard)/    # Routes protégées
│   │   │   ├── page.tsx        # Dashboard principal
│   │   │   ├── planning/       # Planning matriciel
│   │   │   ├── employees/      # Fiches employés
│   │   │   ├── clients/        # Fiches clients
│   │   │   ├── absences/       # Gestion absences
│   │   │   ├── alerts/         # Système alertes
│   │   │   ├── reports/        # Rapports & KPIs
│   │   │   └── settings/       # Configuration
│   │   ├── components/         # UI components
│   │   └── lib/                # API client, auth, utils
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── auth/           # JWT, RBAC, guards
│       │   ├── employees/      # CRUD + enrichments IA
│       │   ├── clients/        # CRUD + sites + postes
│       │   ├── planning/       # Assignments + vues planning
│       │   ├── absences/       # Gestion absences
│       │   ├── ai/             # Moteur IA complet
│       │   │   ├── scoring.service.ts
│       │   │   ├── cascade-solver.service.ts
│       │   │   ├── risk-report.service.ts
│       │   │   ├── learning.service.ts
│       │   │   └── versatility.service.ts
│       │   ├── alerts/         # Système alertes
│       │   ├── emails/         # Resend + templates
│       │   ├── import/         # CSV/Excel import
│       │   ├── export/         # PDF generation
│       │   ├── audit/          # Audit trail
│       │   └── cron/           # Scheduled tasks
│       └── prisma/             # Schema + migrations + seed
├── packages/shared/            # Types partagés front/back
├── docs/                       # Cette documentation
└── docker-compose.yml
```

## Sécurité

- TLS 1.3 + AES-256 au repos, JWT signé HS256 (access 15min + refresh 7j)
- RBAC middleware sur chaque route, isolation par division
- Helmet headers, CORS, rate limiting (100 req/min, 20 pour auth)
- Input validation (class-validator), Prisma (pas de SQL brut)
- Audit trail complet, sauvegardes quotidiennes, rétention 30j
