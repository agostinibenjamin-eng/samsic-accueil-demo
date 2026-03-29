# 10 — Stratégie de scalabilité multi-métier

## Roadmap déploiement
- **V1** (maintenant) : Accueil — 44 employés, 17 clients
- **V2** (3-6 mois) : + App mobile + Portail client + Nettoyage (500 emp, 250 clients)
- **V3** (9-12 mois) : + IA prédictive + Sécurité (si besoin)

## Architecture multi-métier : Divisions
Chaque Division est un espace isolé (employés, clients, compétences, paramètres IA, utilisateurs). Partagé entre divisions : langues, infrastructure, moteur IA (code), templates email (structure).

## Différences Accueil vs Nettoyage

| Aspect | Accueil | Nettoyage |
|--------|---------|-----------|
| Volume | 44 emp / 17 clients | 500 emp / 250 clients |
| Horaires | 7h-18h (journée) | 5h-8h, 18h-21h (hors bureau) |
| Langues | Critique | Moins critique |
| Postes/site | 1-4 | 1-10+ (équipes) |
| Équipe | Individuel | Équipes 2-5 pers |
| Matériel | Non | Oui (machines) |

## Adaptations Nettoyage (V2)
À ajouter : modèle Team (leader + membres), gestion matériel/équipement, checklists qualité, horaires multiples par site (passages matin + soir).

## Performance scaling
- V1 (44 emp) : scoring <50ms, 1 instance backend suffit
- V3 (500 emp) : pré-filtrage avant scoring (<1s), cache Redis, queue asynchrone, pagination lazy
- PostgreSQL : index composites, partitionnement Assignment par mois en V3
