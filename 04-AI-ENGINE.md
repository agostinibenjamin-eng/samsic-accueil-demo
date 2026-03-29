# 04 — Moteur IA — Scoring et algorithmes

> Performance cible : < 200ms pour 44 employés, scalable à 500+

## Scoring 8 critères (100 points)

| # | Critère | Poids | Max | Méthode |
|---|---------|-------|-----|---------|
| 1 | Langues requises | 30% | 30 | Match gradué par niveau (natif > courant > intermédiaire) |
| 2 | Compétences métier | 20% | 20 | Pondération par criticité client |
| 3 | Disponibilité réelle | 15% | 15 | Dispo + pas déjà affecté + charge semaine |
| 4 | Historique client | 10% | 10 | Feedbacks passés chez ce client |
| 5 | Formation site | 8% | 8 | Bonus si backup formé (TRAINED) sur ce poste |
| 6 | Charge hebdomadaire | 7% | 7 | Répartition équitable (favorise sous-chargés) |
| 7 | Certifications | 5% | 5 | Certifications valides requises |
| 8 | Stabilité | 5% | 5 | Pénalise le déplacement d'un titulaire |

**Note** : Le critère 5 remplace "Stand-by désigné" — SAMSIC n'utilise pas de stand-by mais un système de backups formés par site.

## Critères d'élimination (hard constraints)

Avant le scoring, un candidat est éliminé si : déjà affecté ce jour (sauf backup qui peut faire 2 sites), en absence, non disponible ce jour, langue CRITIQUE manquante, compétence CRITIQUE manquante, bloqué par le client, dépassement limite légale heures.

## Cascade Solver

Si aucun candidat direct > 50 points, le moteur explore des réaffectations en chaîne (profondeur max 2, timeout 500ms). Exemple : déplacer Sophie (FR+DE+VIP) d'un poste simple vers le poste exigeant, et la remplacer par un backup disponible.

## Rapport de risque hebdomadaire

Cron dimanche 20h. Scanne : postes sans backup formé, employés surchargés (>90%), certifications expirantes (<30j), clients avec taux remplacement >15%, compétences avec ratio <2 employés.

## Apprentissage

3 mécanismes : ajustement des poids par client (±2% par feedback, plafonné ±10%), affinités employé↔client (score -10 à +10), moteur de règles métier (admin). Détail complet dans 14-AI-ENGINE-DEEP-DIVE.md.
