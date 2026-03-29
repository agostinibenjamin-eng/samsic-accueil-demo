# 12 — Plan du prototype pour la démo de lundi

> **Objectif** : Prototype fonctionnel navigable avec données réelles SAMSIC pour signer le contrat lundi.
> **Principe** : Le prototype EST la base du produit final. Rien n'est jetable.

## Données réelles pour le prototype

### 17 clients réels (Mars 2026)

| # | Client | Code | Postes | Titulaire(s) |
|---|--------|------|--------|-------------|
| 1 | Axxeron Hydrolux | 110054 | 1 | Christelle Santner |
| 2 | Bank of China | 110045+110076 | 3 | Maria Dobrinescu, Catarina Mateus, Noémie Dodrill |
| 3 | Amazon JLL | 110264 | 3 | Lucas Donis, Serap Ayhan, Mauro Tavares |
| 4 | Chambre de Commerce | 110113 | 3 | Kiu Man, Paulo Pereira, Luélly Alves |
| 5 | Generali | 110099+110167 | 3 | Jessica Cabral, Adriano Miceli, Angela Ferreira |
| 6 | House of Startups | 110137 | 1 | Pascale Mayne |
| 7 | China Everbright | 110140 | 1 | Agathe Wyppych |
| 8 | ING | 110174 | 3 | Karim Ghazi, Nadia Tahri, Célia Leo |
| 9 | JAO | 110208 | 1 | Nubya Rita |
| 10 | Mitsubishi | 110216 | 1 | Ophélie Collin |
| 11 | 3D Immo | 110219 | 1 | Cintia Bettencourt |
| 12 | AON | 110220 | 1 | Arnaud Mansion |
| 13 | LIH | 110235 | 3 | Jenelyn Freddi, Aida Sabanovic |
| 14 | Leasys | 110266 | 2 | Valérie Teitgen-Bigot, Aziza Andy |
| 15 | Société Générale | 141062 | 3 | Soubida Baitiche, Rachid Fahfouhi, Kaisy Montroze |
| 16 | ESM | 110277 | 2 | Luana Santos, Rebecca Basse |
| 17 | SAMSIC Agence | 1 | 1 | Anais Dambrin |

### 8 backups : Miangaly (ultra-polyvalent), Maya, Maxime, Miangola, Léa, Graziele, Laura, Débora (congé mat.)

## Scénario démo 20 min

1. **Le problème** (2 min) — Login Mandy → Dashboard : alerte Maria (Bank of China) absente mardi
2. **L'IA en action** (5 min) — Suggestions : #1 Miangaly (84pts), #2 Maya (72pts), #3 Graziele (61pts). Accepter → email auto Bank of China
3. **Le planning** (5 min) — Grille 17 clients × 5 jours. Mode simulation : "Si Karim absent jeudi+vendredi ?"
4. **Le pilotage** (3 min) — Charge employés, taux remplacement, risques clients
5. **Communication** (3 min) — Preview email planning, changement affectation, PDF export
6. **Fiche employé** (2 min) — Miangaly : polyvalence 95, formée 12 sites

## Roadmap 3 jours

**VENDREDI** : Setup monorepo + layout + seed data réelles + dashboard complet
**SAMEDI** : Planning matriciel + moteur IA scoring + panneau suggestions
**DIMANCHE** : Fiches + alertes + emails preview + polish + déploiement staging

## Compatibilité proto → V1

Next.js App Router, composants UI, layout, scoring TS = conservés tels quels. JSON seed → remplacé par API NestJS + PostgreSQL. Auth simulée → NextAuth JWT.
