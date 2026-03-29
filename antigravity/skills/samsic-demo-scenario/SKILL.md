---
name: samsic-demo-scenario
description: "Scénario de démo Samsic Accueil pour lundi. 3 flux à démontrer, données réelles, ordre précis. Utiliser avant tout polish final et avant la démo client."
risk: safe
source: project-local
date_added: "2026-03-28"
---

# Samsic Accueil — Scénario de Démo (Lundi)

> **Audience :** Mandy De Melo + équipe SAMSIC Facility  
> **Durée cible :** 20-25 minutes  
> **Objectif :** Démontrer que l'IA remplace Excel en 3 scénarios réels

---

## Pré-requis avant la démo

- [ ] `npm run dev` → app accessible sur `http://localhost:3000`
- [ ] Données seed rechargées (17 clients, 44 employés)
- [ ] Semaine affichée : **28 Mars – 3 Avril 2026**
- [ ] 2 postes non couverts visibles immédiatement sur le dashboard
- [ ] Mode simulation = OFF au démarrage
- [ ] Navigateur : Chrome full-screen, onglet unique

---

## SCÉNARIO 1 — Absence inattendue (7 minutes)

**Contexte :** Ce matin, Bank of China (réception A) est sans titulaire.

### Étapes

1. **Dashboard** → Montrer le KPI "2 Alertes en cours" (rouge)
2. **Cliquer sur l'alerte** → "Bank of China — Réception A — Non couvert — AUJOURD'HUI"
3. **Planning Matriciel** → Cellule rouge visible sur Bank of China / Lundi
4. **Cliquer sur la cellule rouge** → Panneau IA s'ouvre à droite
5. **Panneau suggestions IA** → 3 candidats affichés :
   - #1 : Backup formé — Score 85/100 — Barres détaillées (C4: ✓ formé, C5: 15 pts historique...)
   - #2 : Backup à former — Score 62/100
   - #3 : Backup à former — Score 41/100
6. **Cliquer "Accepter" sur le candidat #1**
7. **Cellule devient bleue** (backup formé confirmé)
8. **Dashboard** → KPI "Alertes" passe de 2 à 1

**Message clé :** *"Ce qui prenait 15 minutes d'appels téléphoniques : 8 secondes."*

---

## SCÉNARIO 2 — Mode Simulation (8 minutes)

**Contexte :** Mandy veut tester ce qui se passe si Jessica prend ses congés la semaine prochaine.

### Étapes

1. **Cliquer "Mode Simulation"** → Bandeau violet apparaît en haut
2. **Toutes les cellules de Jessica** deviennent orange (avertissement)
3. **Planning** → Montrer les postes maintenant non couverts (rouge)
4. **L'IA propose automatiquement des remplacements** pour chaque poste
5. **Accepter 2 propositions** → Les cellules deviennent bleues
6. **Montrer le "Rapport de simulation"** : 4 postes affectés, 2 résolus automatiquement, 2 nécessitent backup à former
7. **Cliquer "Quitter la simulation"** → Tout revient à l'état initial
8. **Confirmation** : "Ces modifications N'ont PAS été sauvegardées"

**Message clé :** *"Elle peut tester n'importe quel scénario sans risque. C'est ça, la vraie prise de décision."*

---

## SCÉNARIO 3 — Fiche Employé + Polyvalence (5 minutes)

**Contexte :** Mandy cherche qui peut remplacer un profil multi-langues.

### Étapes

1. **Menu Employés** → Liste des 44 employés avec filtre rapide
2. **Filtrer par langue "EN + FR"** → 8 résultats
3. **Cliquer sur un employé** → Fiche détaillée :
   - Photo / Initiales
   - Langues confirmées (badges)
   - Clients habituels (tags)
   - Indice de polyvalence (barre animée)
   - Planning des 4 prochaines semaines (compact)
4. **"Affecter à un poste"** → Le planning se met à jour
5. **Retour dashboard** → Tout est cohérent

**Message clé :** *"En 10 secondes, vous savez qui peut aller où. Plus jamais de 'qui parle anglais ce jeudi ?'"*

---

## Points à ne PAS montrer

❌ Page des paramètres (incomplète)  
❌ Import CSV (pas encore implémenté)  
❌ Export PDF (pas encore implémenté)  
❌ Authentification (simulée)  
❌ Emails (simulés)  

---

## Questions anticipées de Mandy

| Question probable | Réponse |
|------------------|---------|
| "Les données sont vraiment les nôtres ?" | "Pour la démo, ce sont des données représentatives. En V1, on importe vos données réelles Excel en 10 minutes." |
| "Le planning peut s'imprimer ?" | "En V1 oui, export PDF brandé SAMSIC avec un clic. C'est prévu pour la livraison finale." |
| "Et si je refuse la suggestion IA ?" | "Vous cliquez 'Refuser', vous indiquez pourquoi, et l'IA apprend pour la prochaine fois." |
| "C'est sécurisé ?" | "Accès par email + mot de passe, hébergement en Europe, conformité RGPD. On détaille en V1." |
| "Quand c'est livré ?" | "Le produit complet : 8 semaines. Avec votre feedback de lundi, on affine le planning exact." |

---

## Checklist de Répétition (3 fois avant lundi)

- [ ] Run 1 : Chronomètre → cible < 25 min
- [ ] Run 2 : Avec un "spectateur" (poser des questions pendant)
- [ ] Run 3 : Simuler déconnexion WiFi → fallback localhost OK

## When to Use
Utiliser ce skill avant toute session de polish final du prototype.
Également utiliser pour préparer les données seed de démonstration.
