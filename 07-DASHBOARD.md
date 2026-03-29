# 07 — Dashboard et KPIs opérationnels

> Le dashboard montre les **décisions à prendre**, pas les données à interpréter.

## 8 Widgets

### W1 — Barre alertes critiques
Pleine largeur, fond rouge, pulse si critique. Disparaît si 0 alerte. Refresh 30s.

### W2 — Taux d'occupation global
`(postes couverts / total postes actifs) × 100`. Seuils : ≥95% vert, 85-94% orange, <85% rouge. Clic → planning jour.

### W3 — Postes du jour
Compteur : Total/Couverts/Alerte/Non couverts. Code : ✅ vert, 🟡 orange, 🔴 rouge, 🔵 backup.

### W4 — Absences en cours
Liste absences actives triées par urgence. Bouton "Trouver remplaçant" par absence.

### W5 — Suggestions IA en attente
Compteur + urgence (aujourd'hui=rouge, demain=orange). Clic → panneau suggestions.

### W6 — Taux d'occupation par employé
Barres horizontales (heures prestées / contractuelles). <70% bleu, 70-90% vert, 90-100% orange, >100% rouge.

### W7 — Événements clients à risque
Sites fragiles cette semaine : 0 backup formé, titulaire unique, certification expirante, taux remplacement élevé.

### W8 — Taux de remplacement par client
Bar chart horizontal 30j. Seuil rouge à 15%. Tri par taux décroissant.

## Rafraîchissement
Alertes : 30s polling. Postes du jour : 60s. KPIs temps réel : 60s. KPIs pilotage : cache 15min.

## Actions rapides
4 boutons : Déclarer absence, Rechercher remplaçant, Envoyer planning, Rapport de risque.
