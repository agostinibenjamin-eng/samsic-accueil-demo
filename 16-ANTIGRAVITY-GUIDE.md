# 16 — Guide de développement Antigravity — Skills, Roadmaps & Validation

> **Audience** : Développeur / Business Owner utilisant Antigravity IDE ou Claude Code  
> **Objectif** : Référencer TOUS les skills nécessaires pour que l'agent de développement interroge systématiquement les bons skills à chaque étape  
> **Source skills** : https://github.com/sickn33/antigravity-awesome-skills (v7.4.x)

---

## PARTIE 1 — Cartographie des skills par domaine

### Installation préalable

```bash
npx antigravity-awesome-skills --antigravity
# ou pour Claude Code :
npx antigravity-awesome-skills --claude
```

### Sélection des skills pour Samsic Accueil

Sur les 1239+ skills disponibles, voici les **47 skills critiques** sélectionnés pour ce projet, organisés par domaine.

---

### 🏗️ ARCHITECTURE & PLANNING (Phase 0)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@brainstorming` | Cadrage initial, exploration des solutions | Proto + V1 |
| `@architecture` | Design du système global, choix techniques | Proto + V1 |
| `@senior-architect` | Décisions d'architecture complexes (scaling, multi-tenant) | V1 |
| `@c4-context` | Diagrammes C4 d'architecture | V1 |
| `@api-design-principles` | Design des endpoints REST, conventions | Proto + V1 |
| `@doc-coauthoring` | Rédaction des spécifications techniques | Proto + V1 |

---

### 🎨 FRONTEND & DESIGN (Phase 1-2)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@frontend-design` | Direction artistique, UI non-générique | Proto |
| `@react-patterns` | Composants React, hooks, state management | Proto + V1 |
| `@nextjs` | App Router, Server Components, Route Handlers | Proto + V1 |
| `@typescript-expert` | Typage strict, interfaces, génériques | Proto + V1 |
| `@tailwind-css` | Classes utilitaires, design system, responsive | Proto + V1 |
| `@web-design-guidelines` | UX patterns, accessibilité, navigation | Proto + V1 |
| `@css-patterns` | Animations, layouts avancés, grid | Proto |
| `@react-best-practices` | Performance, memo, lazy loading | V1 |

---

### ⚙️ BACKEND & API (Phase 2-3)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@nestjs` (si disponible, sinon `@typescript-expert`) | Modules NestJS, injection de dépendances, guards | V1 |
| `@api-design-principles` | REST conventions, pagination, error handling | V1 |
| `@api-security-best-practices` | Auth JWT, RBAC, rate limiting, input validation | V1 |
| `@python-patterns` ou `@typescript-expert` | Logique métier du moteur IA | V1 |
| `@database-patterns` | Requêtes optimisées, indexation, relations | V1 |

---

### 🗄️ BASE DE DONNÉES & DATA (Phase 2)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@postgres-best-practices` | Configuration PostgreSQL, performance, indexation | V1 |
| `@database-patterns` | Modèle de données, migrations, seeds | V1 |
| `@prisma` (si disponible) | ORM Prisma, schema, queries optimisées | V1 |

---

### 🤖 MOTEUR IA (Phase 2-3)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@architecture` | Architecture du module IA, séparation des concerns | V1 |
| `@test-driven-development` | TDD sur chaque critère de scoring | V1 |
| `@testing-patterns` | Tests unitaires des algorithmes, edge cases | V1 |
| `@debugging-strategies` | Debug du scoring, cascade solver | V1 |

---

### 📧 EMAILS & NOTIFICATIONS (Phase 3)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@react-patterns` | Templates React Email | V1 |
| `@workflow-automation` | Cron jobs, queues, événements déclencheurs | V1 |

---

### 🔒 SÉCURITÉ (Transversal)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@security-auditor` | Audit de sécurité global | V1 |
| `@api-security-best-practices` | Endpoints sécurisés, auth, CORS | V1 |
| `@sql-injection-testing` | Validation des requêtes Prisma | V1 |
| `@vulnerability-scanner` | Scan des dépendances, CVE | V1 |
| `@owasp-top-10` | Checklist OWASP | V1 |

---

### 🧪 TESTING & QUALITÉ (Transversal)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@test-driven-development` | TDD sur les modules critiques (IA, planning) | Proto + V1 |
| `@testing-patterns` | Stratégie de test, mocking, fixtures | V1 |
| `@test-fixing` | Debug des tests qui échouent | V1 |
| `@lint-and-validate` | ESLint, Prettier, validation avant commit | Proto + V1 |
| `@code-review` | Revue de code automatisée | V1 |

---

### 🚀 INFRASTRUCTURE & DÉPLOIEMENT (Phase 4)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@docker-expert` | Conteneurisation, Docker Compose | V1 |
| `@vercel-deployment` ou `@aws-serverless` | Déploiement cloud | V1 |
| `@ci-cd` | GitHub Actions, pipeline de déploiement | V1 |
| `@monitoring` | Logging, métriques, alertes infra | V1 |

---

### 📦 WORKFLOW & PRODUCTIVITÉ (Transversal)

| Skill | Quand l'utiliser | Phase |
|-------|-----------------|-------|
| `@create-pr` | Packaging du code en PR propres | Proto + V1 |
| `@git-strategies` | Branching, commits conventionnels | Proto + V1 |
| `@writing-plans` | Plans de développement structurés | Proto + V1 |
| `@concise-planning` | Planification sprint, estimation | V1 |
| `@workflow-automation` | Automatisation des tâches récurrentes | V1 |

---

## PARTIE 2 — Roadmap Prototype (Lundi)

### Principe : le prototype EST la base du produit final

Le prototype n'est pas un jetable. Chaque fichier créé sera réutilisé en V1. La structure du monorepo, les composants React, le moteur de scoring TypeScript — tout est conservé.

```
PROTOTYPE                          PRODUIT V1
──────────                         ──────────
Next.js App Router         →→→     Même structure
Composants UI (dashboard)  →→→     Enrichis + nouveaux écrans
Données JSON statiques     →→→     Remplacées par API NestJS + PostgreSQL
Scoring IA (TypeScript)    →→→     Déplacé dans le module NestJS
Auth simulée               →→→     Remplacée par NextAuth + JWT
Pas d'emails               →→→     Module email ajouté
Pas d'import               →→→     Module import ajouté
```

### Roadmap Prototype — 3 jours (Vendredi → Dimanche)

#### VENDREDI 28 MARS — Fondations + Dashboard

| Heure | Tâche | Skills à invoquer | Livrable |
|-------|-------|-------------------|----------|
| 9h-10h | Setup monorepo Next.js 14 + Tailwind + shadcn/ui | `@nextjs`, `@tailwind-css` | Repo initialisé, `npm run dev` fonctionne |
| 10h-12h | Layout principal : sidebar + header + routing | `@react-patterns`, `@frontend-design` | Navigation fonctionnelle entre 6 écrans |
| 12h-13h | Données seed : vrais clients + employés SAMSIC (JSON) | `@typescript-expert` | `data/seed.ts` avec 17 clients, 44 employés |
| 14h-16h | Dashboard opérateur : 4 KPIs + alertes + widgets | `@frontend-design`, `@react-patterns` | Dashboard complet et animé |
| 16h-18h | Quick actions + graphiques (Recharts) | `@react-patterns` | Barres charge employé, taux remplacement |

**Checkpoint vendredi soir** : Dashboard fonctionnel avec données réelles SAMSIC.

#### SAMEDI 29 MARS — Planning + Moteur IA

| Heure | Tâche | Skills à invoquer | Livrable |
|-------|-------|-------------------|----------|
| 9h-12h | Planning matriciel : grille clients × jours, code couleur | `@react-patterns`, `@frontend-design` | Planning interactif |
| 12h-13h | Mode simulation (bandeau + couleurs alternatives) | `@react-patterns` | Toggle simulation fonctionnel |
| 14h-17h | Moteur IA scoring 8 critères (TypeScript pur) | `@typescript-expert`, `@test-driven-development` | Scoring réel, suggestions classées |
| 17h-19h | Panneau suggestions IA : score breakdown, accepter/refuser | `@frontend-design`, `@react-patterns` | Panneau latéral avec barres animées |

**Checkpoint samedi soir** : Planning + IA fonctionnels. Le scénario de démo est jouable.

#### DIMANCHE 30 MARS — Fiches + Emails + Polish

| Heure | Tâche | Skills à invoquer | Livrable |
|-------|-------|-------------------|----------|
| 9h-11h | Fiches employés (liste + détail) et fiches clients | `@react-patterns` | CRUD visuel complet |
| 11h-13h | Système d'alertes + panneau notifications | `@react-patterns` | Alertes triées par sévérité |
| 14h-16h | Preview emails + export PDF mock | `@react-patterns` | Templates email visibles |
| 16h-18h | Polish : animations, edge cases, responsive | `@frontend-design`, `@css-patterns` | Transitions fluides |
| 18h-19h | Test du scénario de démo 3 fois | `@testing-patterns` | Aucun bug visible |
| 19h-20h | Déploiement staging (Vercel ou local) | `@vercel-deployment` | URL accessible |

**Checkpoint dimanche soir** : Prototype complet prêt pour la démo de lundi.

---

## PARTIE 3 — Roadmap Produit V1 (8 semaines)

### Vue d'ensemble

```
S1          S2          S3-S4        S5          S6-S7        S8
Cadrage     Design      Backend      Backend     Frontend     Recette
            Prototype   + IA         complet     Intégration  Go-Live
   ▼           ▼           ▼           ▼           ▼           ▼
[VALIDA-    [VALIDA-    [DÉMO #1]   [DÉMO #2]   [DÉMO #3]   [GO-LIVE]
 TION 1]    TION 2]
```

### Semaine 1 — Cadrage & Spécifications

| Jour | Tâche | Skills | Livrable |
|------|-------|--------|----------|
| L-M | Atelier client 2h : valider les données, langues, compétences | `@brainstorming`, `@doc-coauthoring` | Compte-rendu atelier |
| M-J | Finaliser spécifications : modèle de données, API, wireframes | `@architecture`, `@api-design-principles` | Specs finales v1.0 |
| V | Setup infrastructure : repo Git, CI/CD, environnements | `@git-strategies`, `@ci-cd`, `@docker-expert` | Repo + pipeline + staging |

**→ VALIDATION CLIENT #1** (Questionnaire V1 ci-dessous)

### Semaine 2 — Design & Prototype évolué

| Jour | Tâche | Skills | Livrable |
|------|-------|--------|----------|
| L-M | Intégrer le feedback client sur le prototype de lundi | `@frontend-design`, `@react-patterns` | Prototype v2 |
| M-J | Design system final (après réception charte SAMSIC) | `@tailwind-css`, `@css-patterns` | Composants UI finaux |
| V | Parcours utilisateurs validés avec l'équipe SAMSIC | `@web-design-guidelines` | Wireframes validés |

**→ VALIDATION CLIENT #2** (Questionnaire V2)

### Semaines 3-4 — Sprint 1 : Backend + IA

| Tâche | Skills | Livrable |
|-------|--------|----------|
| Setup NestJS, Prisma, PostgreSQL | `@typescript-expert`, `@postgres-best-practices` | Backend fonctionnel |
| Modèle de données + migrations | `@database-patterns` | Schema Prisma déployé |
| API REST CRUD (employés, clients, sites, postes) | `@api-design-principles`, `@api-security-best-practices` | API documentée (Swagger) |
| Module auth (JWT + RBAC) | `@api-security-best-practices`, `@security-auditor` | Auth fonctionnelle |
| Moteur IA scoring (8 critères) | `@test-driven-development`, `@typescript-expert` | Scoring testé unitairement |
| Moteur IA cascade solver | `@debugging-strategies` | Cascade profondeur 2 |
| Import CSV/Excel | `@typescript-expert` | Import fonctionnel |
| Tests unitaires moteur IA | `@testing-patterns`, `@test-fixing` | >80% coverage IA |

**→ DÉMO #1 + VALIDATION CLIENT #3**

### Semaine 5 — Sprint 2 : Backend complet

| Tâche | Skills | Livrable |
|-------|--------|----------|
| Système d'alertes + escalade | `@workflow-automation` | Alertes fonctionnelles |
| Module email (Resend + templates) | `@react-patterns` | 12 templates email |
| Gestion des absences + déclenchement IA | `@typescript-expert` | Flux absence → IA |
| Audit trail | `@database-patterns` | Logs complets |
| Gestion des rôles (RBAC granulaire) | `@api-security-best-practices` | 4 rôles opérationnels |
| Learning engine (feedback loop) | `@test-driven-development` | Ajustement poids |
| Tests d'intégration | `@testing-patterns` | API tests complets |

**→ DÉMO #2 + VALIDATION CLIENT #4**

### Semaines 6-7 — Sprint 3 : Frontend + Intégration

| Tâche | Skills | Livrable |
|-------|--------|----------|
| Connecter le frontend au backend (remplacer les mocks) | `@react-patterns`, `@nextjs` | Frontend connecté |
| Dashboard opérateur connecté aux vraies données | `@react-best-practices` | KPIs temps réel |
| Planning matriciel connecté | `@react-patterns` | Planning interactif réel |
| Panneau IA connecté (suggestions live) | `@react-patterns` | IA en production |
| Mode simulation | `@react-patterns` | Simulation fonctionnelle |
| Fiches employés/clients connectées | `@react-patterns` | CRUD complet |
| Export PDF planning brandé | `@typescript-expert` | PDF téléchargeable |
| Responsive + polish | `@css-patterns`, `@frontend-design` | Mobile-friendly |

**→ DÉMO #3 + VALIDATION CLIENT #5**

### Semaine 8 — Recette + Go-Live

| Tâche | Skills | Livrable |
|-------|--------|----------|
| Import données réelles SAMSIC | `@typescript-expert` | Données migrées |
| Tests en conditions réelles avec Mandy & Jessica | `@testing-patterns` | UAT passé |
| Correction des bugs identifiés | `@test-fixing`, `@debugging-strategies` | 0 bugs critiques |
| Formation (2h) : admin + opérateurs | `@doc-coauthoring` | Guide utilisateur |
| Déploiement production | `@docker-expert`, `@ci-cd`, `@monitoring` | Production live |
| Support renforcé J+1 à J+14 | `@monitoring` | Monitoring actif |

**→ GO-LIVE + VALIDATION CLIENT #6**

---

## PARTIE 4 — Questionnaires de validation client

### VALIDATION #1 — Post-Cadrage (Fin S1)

```
QUESTIONNAIRE DE VALIDATION — ÉTAPE 1 : CADRAGE
Client : SAMSIC Facility
Date : ___/___/2026
Validé par : ___________________ Fonction : ___________________

1. MODÈLE DE DONNÉES
   □ La liste des clients est complète et correcte
   □ La liste des employés est complète et correcte
   □ Les types de postes identifiés correspondent à la réalité
   □ Les horaires par poste sont corrects
   □ Les langues et compétences par employé sont renseignées

2. RÔLES UTILISATEURS
   □ Les rôles définis (Admin, Opérateur, Consultation) correspondent à vos besoins
   □ Mandy = Admin / Jessica = Opérateur — est-ce correct ?
   □ Les permissions par rôle sont adaptées

3. PROCESSUS MÉTIER
   □ Le flux de remplacement décrit correspond à votre processus actuel
   □ Le concept de "backup formé" vs "backup à former" est bien compris
   □ Les types d'absences listés sont complets
   □ Les règles de double affectation (backups uniquement) sont correctes

4. EMAILS
   □ Les 15 flux d'emails identifiés couvrent vos besoins
   □ Les destinataires par flux sont corrects
   □ Le branding SAMSIC a été fourni pour les templates

5. HORS PÉRIMÈTRE V1
   □ Vous confirmez que ces éléments sont reportés en V2 :
     - Application mobile employés
     - Portail client
     - Intégration RH/Paie
     - SMS

COMMENTAIRES :
_______________________________________________________________
_______________________________________________________________

SIGNATURE : _________________________ DATE : ___/___/2026

□ VALIDÉ SANS RÉSERVE
□ VALIDÉ AVEC RÉSERVES (détailler ci-dessus)
□ NON VALIDÉ — Modifications requises
```

---

### VALIDATION #2 — Post-Design (Fin S2)

```
QUESTIONNAIRE DE VALIDATION — ÉTAPE 2 : DESIGN & PROTOTYPE
Client : SAMSIC Facility
Date : ___/___/2026

1. IDENTITÉ VISUELLE
   □ La direction graphique est conforme à la charte SAMSIC
   □ Les couleurs et typographies sont appropriées
   □ Le logo est correctement intégré

2. EXPÉRIENCE UTILISATEUR
   □ La navigation (sidebar) est intuitive
   □ Le dashboard donne les bonnes informations au premier coup d'œil
   □ Le planning matriciel est lisible et compréhensible
   □ Les codes couleur (vert/orange/rouge) sont clairs
   □ Le mode simulation est compris

3. MOTEUR IA (aperçu)
   □ L'affichage des suggestions est clair
   □ Le détail du score par critère est compréhensible
   □ Le concept "accepter/refuser" est intuitif
   □ Les 8 critères de scoring sont pertinents pour votre métier

4. PARCOURS UTILISATEUR
   □ Déclarer une absence → voir les suggestions IA : le flux est naturel
   □ Envoyer le planning au client : le flux est clair
   □ Consulter la fiche d'un employé : l'information est complète

COMMENTAIRES :
_______________________________________________________________

SIGNATURE : _________________________ DATE : ___/___/2026
□ VALIDÉ  □ AVEC RÉSERVES  □ NON VALIDÉ
```

---

### VALIDATION #3 — Post-Démo #1 (Fin S4)

```
QUESTIONNAIRE DE VALIDATION — ÉTAPE 3 : BACKEND + IA
Client : SAMSIC Facility
Date : ___/___/2026

1. API & DONNÉES
   □ L'import de vos données (clients, employés) fonctionne correctement
   □ Les fiches employés sont complètes
   □ Les fiches clients avec exigences sont correctes
   □ La création/modification de données fonctionne

2. MOTEUR IA
   □ Les suggestions de remplacement sont pertinentes
   □ Le classement par score reflète votre logique métier
   □ Les critères éliminatoires (langue critique manquante) fonctionnent
   □ La cascade (réaffectation en chaîne) produit des résultats cohérents
   □ Le temps de réponse est acceptable (< 1 seconde)

3. AUTHENTIFICATION
   □ La connexion par email/mot de passe fonctionne
   □ Les rôles et permissions sont correctement appliqués

4. TEST MÉTIER — Scénario en conditions réelles
   Avec Mandy : simuler 3 absences réelles du mois dernier
   □ Scénario 1 : _______________ → Résultat IA : _______________
     □ Pertinent  □ Partiellement  □ Non pertinent
   □ Scénario 2 : _______________ → Résultat IA : _______________
     □ Pertinent  □ Partiellement  □ Non pertinent
   □ Scénario 3 : _______________ → Résultat IA : _______________
     □ Pertinent  □ Partiellement  □ Non pertinent

COMMENTAIRES :
_______________________________________________________________

SIGNATURE : _________________________ DATE : ___/___/2026
□ VALIDÉ  □ AVEC RÉSERVES  □ NON VALIDÉ
```

---

### VALIDATION #4 — Post-Démo #2 (Fin S5)

```
QUESTIONNAIRE DE VALIDATION — ÉTAPE 4 : BACKEND COMPLET
Client : SAMSIC Facility
Date : ___/___/2026

1. SYSTÈME D'ALERTES
   □ Les alertes critiques apparaissent correctement
   □ L'escalade (30 min non traité → email admin) fonctionne
   □ Les alertes de certification expirante sont pertinentes

2. EMAILS
   □ Le template "planning hebdomadaire" est conforme
   □ Le template "changement d'affectation" est clair
   □ Le template "nouvelle affectation employé" contient les bonnes infos
   □ Les emails arrivent aux bons destinataires
   □ Le branding SAMSIC est respecté

3. GESTION DES ABSENCES
   □ La déclaration d'absence déclenche bien la recherche IA
   □ Les types d'absence couvrent vos cas (maladie, congé, formation...)
   □ L'historique des absences est consultable

4. AUDIT & SÉCURITÉ
   □ Chaque action est tracée (qui a fait quoi, quand)
   □ Les rôles sont correctement appliqués (Jessica ne peut pas supprimer)
   □ Le mot de passe doit être changé à la première connexion

COMMENTAIRES :
_______________________________________________________________

SIGNATURE : _________________________ DATE : ___/___/2026
□ VALIDÉ  □ AVEC RÉSERVES  □ NON VALIDÉ
```

---

### VALIDATION #5 — Post-Démo #3 (Fin S7)

```
QUESTIONNAIRE DE VALIDATION — ÉTAPE 5 : PLATEFORME COMPLÈTE
Client : SAMSIC Facility
Date : ___/___/2026

1. DASHBOARD
   □ Les KPIs affichés sont pertinents pour votre pilotage
   □ Les données sont correctes et à jour
   □ L'ergonomie globale vous convient

2. PLANNING
   □ La vue hebdomadaire est lisible avec tous vos clients
   □ Le drag & drop d'affectation fonctionne (si implémenté)
   □ L'export PDF est conforme à vos attentes
   □ L'envoi par email au client fonctionne

3. MOTEUR IA COMPLET
   □ L'apprentissage fonctionne (les suggestions s'améliorent)
   □ Le rapport de risque hebdomadaire est utile
   □ L'indice de polyvalence par employé est pertinent

4. TEST UTILISATEUR — Session avec Mandy & Jessica (1h)
   □ Mandy peut gérer les clients et employés
   □ Jessica peut gérer le planning quotidien
   □ Les deux peuvent traiter les suggestions IA
   □ L'envoi d'emails fonctionne de bout en bout
   □ Le temps passé sur les tâches courantes est réduit vs Excel

   Temps estimé par Mandy pour un remplacement :
   - Avant (Excel) : ___ minutes
   - Maintenant (Samsic Accueil) : ___ minutes

COMMENTAIRES :
_______________________________________________________________

SIGNATURE : _________________________ DATE : ___/___/2026
□ VALIDÉ  □ AVEC RÉSERVES  □ NON VALIDÉ
```

---

### VALIDATION #6 — Go-Live (Fin S8)

```
QUESTIONNAIRE DE VALIDATION — ÉTAPE 6 : MISE EN PRODUCTION
Client : SAMSIC Facility
Date : ___/___/2026

1. MIGRATION DES DONNÉES
   □ Tous les clients sont importés correctement
   □ Tous les employés sont importés correctement
   □ Le planning actuel est migré
   □ Les contacts clients sont renseignés
   □ Aucune donnée manquante

2. FORMATION
   □ Mandy et Jessica ont été formées (2h)
   □ Le guide utilisateur a été remis
   □ Les questions ont été traitées

3. PRODUCTION
   □ L'URL de production est accessible
   □ Les comptes utilisateurs sont créés
   □ Les emails partent correctement (test effectué)
   □ Les performances sont satisfaisantes

4. SUPPORT
   □ Le canal de support est en place (email / Slack / Teams)
   □ Le SLA est compris (24h ouvrées, 4h pour critiques)
   □ Le support renforcé 2 semaines est confirmé

5. ACCEPTATION FINALE
   □ La plateforme répond au cahier des charges initial
   □ Les fonctionnalités additionnelles (rapport risque, polyvalence,
     export PDF, notifications) sont incluses
   □ La documentation est complète (technique + utilisateur)
   □ Le code source est livré

ACCEPTATION :
□ RECETTE VALIDÉE — Mise en production autorisée
□ RECETTE VALIDÉE AVEC RÉSERVES — Liste des réserves en annexe
□ RECETTE NON VALIDÉE — Retour en développement

SIGNATURE CLIENT : _________________________ DATE : ___/___/2026
SIGNATURE A&A : _________________________ DATE : ___/___/2026
```

---

## PARTIE 5 — Instructions pour Antigravity

### Prompt système à inclure dans le projet

Créer un fichier `.agent/CLAUDE.md` ou `.antigravity/INSTRUCTIONS.md` à la racine du projet :

```markdown
# Samsic Accueil — Instructions Agent

## Contexte
Tu développes la plateforme Samsic Accueil pour A&A Digital Factory.
C'est une plateforme SaaS de gestion intelligente des plannings d'accueil
pour SAMSIC Facility (Luxembourg). 44 employés, 17 clients, ~35 postes/jour.

## Documentation
Avant de coder, TOUJOURS consulter les fichiers dans /docs/ :
- /docs/architecture/05-ARCHITECTURE.md — Stack et structure
- /docs/data-model/03-DATA-MODEL.md — Schéma Prisma complet
- /docs/architecture/04-AI-ENGINE.md — Moteur IA scoring
- /docs/architecture/14-AI-ENGINE-DEEP-DIVE.md — IA apprentissage
- /docs/api/06-API-SPEC.md — Endpoints REST
- /docs/dashboard/07-DASHBOARD.md — Widgets et KPIs
- /docs/emails/08-EMAIL-FLOWS.md — 15 flux email
- /docs/design/09-DESIGN-SYSTEM.md — Charte graphique
- /docs/15-REAL-DATA-ANALYSIS.md — Données réelles SAMSIC

## Skills obligatoires par tâche
- Frontend : @frontend-design + @react-patterns + @nextjs + @tailwind-css
- Backend : @typescript-expert + @api-design-principles + @api-security-best-practices
- Base de données : @postgres-best-practices + @database-patterns
- Tests : @test-driven-development + @testing-patterns
- Sécurité : @security-auditor + @owasp-top-10
- Déploiement : @docker-expert + @ci-cd + @monitoring
- Architecture : @architecture + @senior-architect

## Conventions
- Code en anglais, UI en français
- Conventional Commits (feat:, fix:, docs:, chore:)
- Tests obligatoires pour le moteur IA (>80% coverage)
- Pas de console.log en production
- Prisma pour toutes les requêtes DB (jamais de SQL brut)

## Direction design
Bold Geometric : formes angulaires, pas d'arrondis, rouge SAMSIC #D42E12,
typographie Outfit 900, fond crème #F5F3EF, sidebar noire #0A0A0A.
JAMAIS de purple gradients, Inter, ou esthétique IA générique.
```
