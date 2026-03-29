# 08 — Flux d'emails — Clients et Employés

> Stack : Resend + React Email · Branding SAMSIC · Retry 4 tentatives

## 15 flux email

| # | Événement | Destinataire | Type | V1 |
|---|-----------|-------------|------|----|
| E1 | Planning hebdo généré | Contact client | Auto (lundi 7h) ou manuel | ✅ |
| E2 | Changement d'affectation | Contact client | Auto | ✅ |
| E3 | Nouvelle affectation (remplacement) | Employé | Auto | ✅ |
| E4 | Rappel affectation J-1 | Employé | Auto (18h veille) | ✅ |
| E5 | Annulation d'affectation | Employé + client | Auto | ✅ |
| E6 | Alerte critique non traitée (30min) | Admin | Escalade auto | ✅ |
| E7 | Rapport de risque hebdo | Admin + opérateurs | Auto (dimanche 20h) | ✅ |
| E8 | Certification expire <30j | Admin + employé | Auto | ✅ |
| E9 | Poste non couvert le jour même | Admin | Alerte urgente | ✅ |
| E10 | Bienvenue nouvel utilisateur | Nouvel utilisateur | À la création | ✅ |
| E11 | Reset mot de passe | Utilisateur | À la demande | ✅ |
| E12 | Confirmation remplacement réussi | Contact client | Auto | ✅ |
| **E13** | **Proposition nouveau collaborateur/backup** | **Contact client** | **Manuel (opérateur)** | **✅ NOUVEAU** |
| **E14** | **Planning congés annuels** | **Contact client + admin** | **Manuel** | **✅ NOUVEAU** |
| **E15** | **Proposition remplacement congés** | **Contact client** | **Auto** | **✅ NOUVEAU** |

E13-E15 ajoutés suite à la demande du client : "propositions pour des nouveaux collaborateurs ou backups" et "proposer les congés annuels et les remplacements sur ces périodes".

## Templates principaux

**E1 — Planning hebdo** : Tableau L-V avec personnel affecté, PDF brandé en PJ.
**E2 — Changement affectation** : Date, site, nouveau personnel, remplace qui, coordonnées.
**E3 — Nouvelle affectation employé** : Client, adresse, date, horaire, poste, contact sur site.
**E13 — Proposition collaborateur** : Profil du nouveau collaborateur, langues, compétences, disponibilité.
**E14 — Congés annuels** : Tableau des congés planifiés + remplaçants proposés par poste/date.

## Retry policy
1ère tentative immédiate, 2ème +5min, 3ème +15min, 4ème +1h + alerte admin. Rate limit : 100/h/division, 3/h/destinataire.

## RGPD
Contacts opt-out-ables (sauf emails opérationnels), lien désinscription, données supprimables via admin.
