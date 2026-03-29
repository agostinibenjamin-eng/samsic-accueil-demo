# 01 — Utilisateurs, Rôles et Permissions

---

## Rôles V1

### SUPER ADMIN (`super_admin`)
**Qui** : A&A Digital Factory + Direction SAMSIC (1-2 personnes)
- Configuration globale, gestion des divisions, paramètres IA, templates email
- Accès total à toutes les données et fonctionnalités

### ADMIN MÉTIER (`admin`)
**Qui** : Mandy De Melo (Team Leader, responsable planning)
- CRUD clients, employés, postes de sa division
- Supervision des opérateurs, validation des affectations critiques
- Consultation rapports de risque et KPIs, configuration exigences clients

### OPÉRATEUR PLANNING (`operator`)
**Qui** : Jessica Santos (assistante planning), Paola Soares (Team Leader)
- Gestion quotidienne du planning, déclaration/gestion absences
- Validation/refus des suggestions IA, affectation manuelle
- Envoi plannings clients, suivi alertes, mode simulation

### CONSULTATION (`viewer`)
**Qui** : Direction, managers régionaux, contrôle qualité
- Lecture seule sur tous les modules (plannings, KPIs, rapports)

## Matrice de permissions

| Module | Super Admin | Admin | Opérateur | Consultation |
|--------|:-----------:|:-----:|:---------:|:------------:|
| Dashboard | ✅ complet | ✅ complet | ✅ complet | ✅ lecture |
| Planning matriciel | ✅ | ✅ | ✅ | ✅ lecture |
| Mode simulation | ✅ | ✅ | ✅ | ❌ |
| Fiches employés | ✅ CRUD | ✅ CRUD | ✅ lecture + dispo | ✅ lecture |
| Fiches clients | ✅ CRUD | ✅ CRUD | ✅ lecture | ✅ lecture |
| Gestion absences | ✅ | ✅ | ✅ | ✅ lecture |
| Suggestions IA | ✅ | ✅ | ✅ accepter/refuser | ✅ lecture |
| Alertes | ✅ | ✅ | ✅ traiter | ✅ lecture |
| Emails (envoi) | ✅ | ✅ | ✅ | ❌ |
| Rapports & KPIs | ✅ | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ✅ | ✅ |
| Import données | ✅ | ✅ | ❌ | ❌ |
| Gestion utilisateurs | ✅ | ✅ sa division | ❌ | ❌ |
| Configuration IA | ✅ | ❌ | ❌ | ❌ |
| Audit trail | ✅ | ✅ sa division | ❌ | ❌ |
| Paramètres système | ✅ | ❌ | ❌ | ❌ |

## Rôles futurs (V2+)

- **EMPLOYÉ** (`employee`) : App mobile — consultation planning, déclaration absence, confirmation affectation
- **CLIENT** (`client`) : Portail web lecture — planning du site, historique, signalement

## Sécurité des accès

- JWT signé (access 15min + refresh 7j), middleware RBAC sur chaque route
- Isolation par division, audit de chaque action
- Expiration après 8h d'inactivité, bcrypt hash, force reset premier login
