# 02 — Liste exhaustive des fonctionnalités

> 86 fonctionnalités V1 · 49 critiques · 12 modules

## Module 1 — Auth & Accès (6 fonctionnalités, 4 critiques)
- 🔴 Login email/password JWT · 🔴 RBAC 4 rôles · 🔴 Reset mot de passe · 🔴 CRUD utilisateurs
- 🟡 Force reset premier login · 🟡 Audit connexions

## Module 2 — Dashboard & Centre de commande (10, 6 critiques)
- 🔴 Dashboard opérateur (actions à prendre) · 🔴 Alertes actionnables · 🔴 Taux occupation global
- 🔴 Taux occupation par employé · 🔴 Taux remplacement par client · 🔴 Événements clients à risque
- 🔴 Widget "Aujourd'hui" · 🟡 Widget "Cette semaine" · 🟡 Widget "Absences en cours"
- 🔴 Widget "Suggestions IA en attente" · 🟡 Historique métriques 30/90j

## Module 3 — Gestion des employés (10, 5 critiques)
- 🔴 CRUD employé · 🔴 Profil compétences (langues + niveaux) · 🔴 Certifications (avec expiration)
- 🔴 Disponibilités récurrentes · 🔴 Charge hebdomadaire
- 🟡 Indice polyvalence IA · 🟡 Historique affectations · 🟡 Type employé (titulaire/backup/team leader)
- 🟡 Statut formation par site (formé/à former) · 🟢 Photo profil

## Module 4 — Gestion des clients (9, 5 critiques)
- 🔴 CRUD client · 🔴 Sites et postes (1 client = N sites = N postes) · 🔴 Exigences pondérées (critique/important/souhaité)
- 🔴 Langues requises par poste · 🔴 Horaires par poste (variables : 7h-18h, 9h-17h, 12h-17h, 8h-16h)
- 🟡 Contacts client (multi-contacts) · 🟡 Codes contrats (110XXX) · 🟡 Historique couverture
- 🟡 Préférences nominatives (employé préféré/refusé)

## Module 5 — Planning matriciel (9, 6 critiques)
- 🔴 Vue hebdomadaire clients × jours + code couleur · 🔴 Statuts : confirmé/remplacé/absent/non couvert
- 🔴 Mode simulation "What-if" · 🔴 Filtre par client/employé/statut · 🔴 Détail créneau (popover)
- 🔴 Détection conflits (double affectation, sauf backup 2 sites/jour)
- 🟡 Drag & drop · 🟡 Vue par employé · 🟢 Vue mensuelle

## Module 6 — Moteur IA (8, 4 critiques)
- 🔴 Scoring multi-critères 8 dimensions · 🔴 Suggestions classées (top 5) · 🔴 Explication du score
- 🔴 Accepter/Refuser avec motif · 🟡 Optimisation globale (cascade) · 🟡 Apprentissage des préférences
- 🔴 Rapport de risque hebdomadaire · 🟡 Score de confiance

## Module 7 — Gestion absences (5, 3 critiques)
- 🔴 Déclaration (par opérateur) · 🔴 Types paramétrables (maladie, congé, formation, injustifié, maternité)
- 🔴 Déclenchement auto IA · 🟡 Absence récurrente (congé planifié) · 🟡 Historique par employé

## Module 8 — Alertes (7, 4 critiques)
- 🔴 Alertes temps réel · 🔴 Priorisation (critique/important/info) · 🔴 Escalade auto (30 min)
- 🔴 Notification email · 🟡 Certification expirante · 🟡 Surcharge employé · 🟡 Centre notifications

## Module 9 — Emails (7, 4 critiques) — mis à jour avec demandes client
- 🔴 Planning hebdo au client · 🔴 Changement d'affectation au client · 🔴 Nouvelle affectation à l'employé
- 🔴 Alerte critique à l'admin · 🟡 Rappel J-1 employé · 🟡 Rapport de risque hebdo
- 🟡 Proposition nouveau collaborateur/backup au client (NOUVEAU — demande client)
- 🟡 Planification congés annuels + remplacements (NOUVEAU — demande client)

## Module 10 — Import/Migration (4, 2 critiques)
- 🔴 Import CSV/Excel employés · 🔴 Import CSV/Excel clients
- 🟡 Détection anomalies · 🟡 Prévisualisation avant import

## Module 11 — Export/Reporting (4, 1 critique)
- 🔴 Export planning PDF brandé SAMSIC · 🟡 Export données CSV · 🟡 Rapport couverture par client
- 🟡 Rapport risque hebdo PDF

## Module 12 — Configuration (7, 5 critiques)
- 🔴 Divisions/métiers · 🔴 Référentiel compétences · 🔴 Référentiel langues (avec niveaux)
- 🔴 Référentiel certifications · 🔴 Créneaux horaires paramétrables
- 🟡 Seuils alertes · 🟡 Pondération IA ajustable
