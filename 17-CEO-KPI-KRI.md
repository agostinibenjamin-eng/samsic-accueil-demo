# 17 — Vision CEO — KPIs, KRIs, Design graphique & Disponibilité des données

## DISPONIBILITÉ DES DONNÉES

### 🟢 Calculables dès le lancement (données Excel existantes)

| KPI/KRI | Indicateur | Source |
|---------|-----------|--------|
| Q1 | Taux de couverture | Planning V6 (31 mois) |
| Q2 | Taux de remplacement | Planning V6 (backup nommé = remplacement) |
| P2 | Équité répartition | Planning V6 (jours par employé) |
| P3 | Occupation backups | Planning V6 |
| H1 | Absentéisme | Planning V6 (marqueurs ABS, CS, congé) |
| H3 | Polyvalence | Planning V6 (sites par backup) |
| H4 | Formation backups | Planning V6 (backups listés par client) |
| KRI-C2 | Clients sans redondance | Planning V6 |
| KRI-D2 | Dépendance super-backups | Planning V6 |
| KRI-O2 | Postes orphelins | Planning V6 |
| KRI-O3 | Vélocité dégradation | Planning V6 tendance |

### 🟡 Après collecte S1 (demander à Mandy lundi)

| KPI/KRI | Indicateur | Donnée manquante |
|---------|-----------|-----------------|
| P1 | Occupation pool | Heures contractuelles par employé |
| KRI-D1 | Compétences rares | Langues + compétences employés |
| KRI-F1 | Certifications | Liste certifications avec dates |
| KRI-O1 | Surcharge pool | Heures contractuelles |
| KRI-C1 | Fragilité client | Score partiel sans feedbacks |

### 🟢 Après 1 mois d'utilisation

Q3 Délai résolution · Q4 Satisfaction · O2 Acceptation IA · O3 Incidents évités

### 🔴 V2 (intégration financière)

R1 Facturation · R2 CA/employé · R3 Marge/client · KRI-D3 Concentration CA · KRI-F2 Heures légales

---

## SPÉCIFICATIONS GRAPHIQUES — Charte SAMSIC

Palette : Marine #24303b · Sable #bfa894 · Bleu web #0078b0
Typo KPI : Roboto Black (chiffres) · Open Sans (labels/texte)
Fond page : #ede5de · Cartes : blanc · Bordures : #ded4c9
Style : Bold Geometric — border-radius 0, trait latéral 4px

### Hero Metrics (5 stat cards en ligne)

Chaque carte : fond blanc, trait latéral 4px (couleur contexte), chiffre Roboto Black 48px #24303b,
label Open Sans 600 10px uppercase #999ea3 letter-spacing 2px, tendance ▲▼ 13px vert/rouge,
sparkline 30j intégrée (stroke #0078b0 1.5px, fill #0078b0 8% opacité, h24px, aucun axe).

### G1 — Tendance couverture : Area chart (Recharts)
Courbe #24303b 2px monotone, remplissage #24303b 6%, seuil 97% dashed #C62828 1px,
zone danger <93% fond #FFEBEE 30%, axe X semaines Open Sans 300 11px #999ea3, tooltip fond #24303b blanc.

### G2 — Remplacement par client : Horizontal bar chart
Barres ≤10% #24303b, 10-15% #bfa894, >15% #C62828. Seuil 15% dashed #C62828.
Labels client Open Sans 400 13px gauche, % Roboto 700 13px droite, pastille carrée 8px statut.

### G3 — Distribution charge pool : Histogram vertical
<70% bleu #0078b0, 70-80% bleu clair #80bad6, 80-95% vert #2E7D32, 95-100% orange #E87A1E, >100% rouge #C62828.
Labels bas Open Sans 600 10px uppercase #5c666e, nombre Roboto 700 14px #24303b au-dessus.

### G4 — Matrice risque clients : Scatter plot
X=taux remplacement 0-25%, Y=fragilité 0-100. Bulles proportionnelles au nombre de postes.
Quadrant haut-droite fond #FFEBEE 15%. Couleur : #C62828 danger, #E87A1E alerte, #24303b stable.

### G5 — Dépendance backups : Treemap
Bloc >30% #C62828 (danger), 15-30% #E87A1E, 8-15% #bfa894, <8% #24303b.
Label Roboto 700 blanc dans chaque bloc. Alerte si top1 >40%.

### G6 — Heatmap absentéisme : CSS Grid custom
Cellules carrées 28x28px gap 3px. 0 abs=#ede5de, 1=#ccbaab, 2-3=#bfa894, 4+=#24303b.
Jours en colonnes (L-V), semaines en lignes. Tooltip avec noms des absents.

### G7 — Évolution acceptation IA : Area chart
Courbe #0078b0 2.5px, remplissage #0078b0 8%. Objectif 80% dashed #24303b 1px.
Zone "apprentissage" S1-S12 fond #cce3f0 10%.

### T1 — Classement clients : Table triable
Header fond #24303b texte blanc Open Sans 700 11px uppercase. Lignes alternées blanc/#ede5de.
Trait gauche 4px couleur statut. Pastille carrée : Stable #2E7D32, Attention #E87A1E, Fragile/Critique #C62828.
Ligne critique fond #FFEBEE. Tri asc/desc sur colonnes.

### Top 3 risques : Cards empilées
Critique : trait 6px #C62828 fond #FFEBEE. Alerte : trait 6px #E87A1E fond #FFF3E0. Info : trait 6px #0078b0 fond #cce3f0.
Titre Open Sans 700 13px couleur severity. Action Open Sans 600 12px #0078b0.

---

## 15 KPIs COMPLETS

### Axe Revenus
R1 Facturation effective (≥98%) · R2 CA/employé · R3 Marge/client (≥10%)

### Axe Qualité
Q1 Couverture globale (≥97%) · Q2 Remplacement (≤10%) · Q3 Délai résolution (≤30min) · Q4 Satisfaction (≥4.2/5)

### Axe Pool
P1 Occupation pool (90-98%) · P2 Équité répartition (écart-type <10%) · P3 Occupation backups (≥90%)

### Axe Efficience
O1 Temps gestion planning (-50% vs Excel) · O2 Acceptation IA (≥80%) · O3 Incidents évités (≥70% anticipés)

### Axe Capital humain
H1 Absentéisme (<5%) · H2 Turnover (<15%) · H3 Polyvalence (≥60/100) · H4 Formation backups (≥5 sites/backup)

## 10 KRIs COMPLETS

C1 Fragilité client (score>60) · C2 Clients sans redondance (0 poste sans 2 backups)
F1 Certifications expirantes (0 dans 30j) · F2 Dépassement heures (0)
D1 Compétences rares (ratio≥2) · D2 Dépendance super-backups (top3 <70%) · D3 Concentration CA (top3 <60%)
O1 Surcharge pool (<25% en surcharge) · O2 Postes orphelins (0) · O3 Vélocité dégradation (stable)
