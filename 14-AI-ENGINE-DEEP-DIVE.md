# 14 — MOTEUR IA — BIBLE EXHAUSTIVE DU SCORING & PLANIFICATION

> Rédigé du point de vue d'un gérant de société de prestation d'accueil (40 agents, 17 clients, ~35 postes).
> Ce document est **le cahier des charges définitif**. Chaque ligne traduit un problème rencontré sur le terrain.

---

## PARTIE 1 — LES 10 FAMILLES DE CONTRAINTES TERRAIN

### Famille 1 : Contraintes Temporelles (Shifts & Horaires)

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Granularité horaire** | Les postes ne sont pas "à la journée". Un poste peut être 07:00→12:00 ou 12:00→18:00. Une même personne PEUT couvrir 2 postes le même jour si les créneaux ne se chevauchent pas. | Le scoring doit vérifier le **conflit horaire**, pas le conflit de date. |
| **Repos légal 11h** | Entre deux prestations, le Code du Travail luxembourgeois impose 11h de repos minimum. Un agent terminant à 22:00 ne peut pas reprendre avant 09:00 le lendemain. | Critère éliminatoire. Vérifier `endTime[J] + 11h ≤ startTime[J+1]`. |
| **Maximum 10h/jour** | Un agent ne peut pas dépasser 10h de travail effectif par jour. | Cumul des shifts du jour avant proposition. |
| **Maximum 48h/semaine** | Maximum légal, convention collective. Certains contrats à 35h, d'autres 39h ou 40h. Les heures supplémentaires au-delà coûtent plus cher. | Critère pondéré : pénalité si on approche le plafond, éliminatoire si dépassé. |
| **6 jours consécutifs max** | Un employé ne peut pas travailler plus de 6 jours d'affilée sans repos hebdomadaire (24h + 11h repos). | Critère éliminatoire. Vérifier les 6 derniers jours. |
| **Temps de trajet inter-sites** | Si un agent fait un poste à Leudelange (08:00→12:00) et un autre à Kirchberg (13:00→18:00), il faut qu'il puisse physiquement s'y rendre. Certains n'ont pas de véhicule. | Le moteur doit estimer le temps de trajet entre zones et croiser avec `hasVehicle`. |
| **Ponctualité contractuelle** | Certains clients (banques, institutions) tolèrent 0 min de retard. Le coverage doit être assuré 15 min avant le début officiel du poste. | Matrice de tolérance par client. Buffer de 15min à intégrer. |

### Famille 2 : Profil Employé — Compétences & Éligibilité

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Langues et niveaux** | Ce n'est pas binaire. Parler anglais "BEGINNER" ≠ "NATIVE". Un client bancaire luxembourgeois exige EN FLUENT minimum. Le IA doit scorer le NIVEAU, pas juste la présence. | C1 refactoré : comparer `employee.languageLevel ≥ post.minLanguageLevel`. |
| **Compétences techniques** | Standard téléphonique, gestion de courrier, badge visiteurs, logiciel SIEVERT, SAP Front Desk, protocole VIP. Chaque poste en requiert un sous-ensemble. | C2 : vérifier chaque `requiredSkill` avec son niveau minimum. |
| **Certifications expirées** | SST (Sauveteur Secouriste du Travail), SSIAP (Sécurité Incendie). Certaines expirent ! Un agent avec un SST expiré ne peut PAS couvrir un poste qui l'exige. | Critère éliminatoire : `certification.expiresAt > today`. |
| **Type de contrat** | CDI : prioritaire. CDD : acceptable mais attention à la date de fin. INTERIM : dernière option, rentabilité moindre et risque de qualité. APPRENTI : jamais seul sur un poste. | Score bonus CDI > CDD > INTERIM. APPRENTI éliminatoire si poste en solo. |
| **Période d'essai / Onboarding** | Un nouvel employé dans ses 3 premiers mois ne devrait pas être envoyé chez un client VIP sans shadowing préalable. | Flag `isOnboarding` : exclure des postes à criticité `HIGH` ou `VIP`. |
| **Restrictions médicales** | Certains agents ont des mi-temps thérapeutiques, interdictions de station debout prolongée, ou travail de nuit interdit. | Table `MedicalRestriction` : bloquant pour certains types de postes. |

### Famille 3 : Contraintes Client — Préférences & Exigences

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Niveau de priorité client** | Client VIP (banques : Bank of China, ING, Generali) vs Standard (3D Immo, AON). En cas de conflit de ressource, le VIP passe d'abord. | `clientPriority: 'VIP' | 'PREMIUM' | 'STANDARD'`. Facteur multiplicateur sur le score final ou préemption dans la cascade. |
| **Préférence nominative** | "Je veux Karim à la réception de ING chaque lundi." Le client peut avoir des préférences fortes pour certains agents. | Table `ClientEmployeePreference` : +20pts dans le scoring. |
| **Blacklist client-employé** | "Ne m'envoyez PLUS Jessica chez Generali." Si un client a blacklisté un agent, c'est éliminatoire. Point. | Critère éliminatoire absolu. Pas de discussion. |
| **Feedback client historique** | Le client a noté 2/5 la dernière prestation de Miangaly chez JAO → l'IA doit baisser la confiance et le score d'affinité automatiquement. | Boucle de feedback intégrée : `EmployeeClientAffinity` se met à jour. |
| **Continuité de service** | Certains clients détestent voir un visage différent chaque semaine. Ils veulent la MÊME personne, la stabilité. D'autres s'en fichent. | Flag `post.continuitySensitivity: 'HIGH' | 'MEDIUM' | 'LOW'`. Bonus fort pour l'agent qui était là la semaine précédente. |
| **Dress code & présentation** | Certains postes exigent tenue formelle, uniforme spécifique. L'agent doit avoir l'équipement. | `post.dressCode` + `employee.uniformAvailable`. Bloquant si uniforme requis et non fourni. |
| **Habilitation sécurité** | Sites sensibles (défense, institutions européennes, ESM). Background check requis. L'IA ne peut PAS proposer un agent non habilité. | Critère éliminatoire : `employee.securityClearanceLevel ≥ post.requiredClearance`. |

### Famille 4 : Gestion des Absences & Urgences

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Types d'absence** | Arrêt maladie (imprévisible), congé planifié (prévisible), urgence familiale (immédiat), formation (planifié), injustifié (problème RH), maternité (longue durée). | Chaque type a un lead-time différent. L'IA priorise différemment selon l'urgence. |
| **Absence en chaîne** | L'agent A est absent → on met B → B tombe malade 2 jours après → il faut C. Le système doit gérer les cascades dans le temps. | `Replacement` doit supporter le remplacement d'un remplaçant. Historique complet de la chaîne. |
| **Absence partielle** | Un agent est absent uniquement le matin ou uniquement le vendredi. Le poste n'est pas forcément vacant toute la journée. | L'absence doit supporter `startTime` / `endTime` optionnels, pas seulement `startDate` / `endDate`. |
| **Notification d'urgence** | Lundi 06h30, un agent appelle malade pour un poste qui commence à 07h00. On a 30 minutes pour trouver un remplaçant. | Le moteur doit tourner en < 200ms et proposer les agents qui sont physiquement PROCHES et disponibles IMMÉDIATEMENT. Filtre par zone géographique et temps de trajet. |
| **Absence récurrente (Pattern)** | Maria est absente 8.5% du temps. Elle est souvent malade le lundi. Le système doit le détecter et pré-positionner un backup les lundis. | Module d'analyse prédictive : détection de patterns jour/semaine et alerte proactive. |

### Famille 5 : La Cascade (L'Effet Domino)

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Déplacement de titulaire** | Si le poste VIP Bank of China est vacant et que le meilleur candidat est un titulaire d'un poste standard, on peut le "voler" à son poste actuel SI on trouve quelqu'un pour le remplacer. | Cascade récursive avec limite de profondeur (max 2-3). |
| **Priorité des postes** | Dans une cascade, le poste le PLUS critique doit être comblé en premier. On ne sacrifie pas un VIP pour un poste standard. | Matrice de priorité : `VIP > PREMIUM > STANDARD`. Le cascade solver trie par criticité. |
| **Coût de la cascade** | Chaque mouvement dans une cascade = disruption. On préfère une solution directe (profondeur 0) à une cascade de profondeur 3, même si le score est légèrement inférieur. | Pénalité -5pts par niveau de profondeur. La solution la plus simple gagne à score égal. |
| **Validation humaine obligatoire** | Une cascade ne s'exécute JAMAIS automatiquement. L'IA la propose, l'opérateur valide. Si on déplace un titulaire, il faut aussi prévenir le client d'origine. | Mode "proposition" avec workflow de validation incluant notification au client impacté. |
| **Transaction atomique** | Soit la cascade entière passe, soit rien ne bouge. On ne peut pas déplacer A vers B si on n'a pas trouvé C pour remplacer A. | Pattern transactionnel : tout ou rien. Rollback si un maillon casse. |

### Famille 6 : Optimisation Financière & Rentabilité

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Heures non affectées = perte sèche** | Un CDI à 35h payé 16€/h mais affecté seulement 28h = 7h × 16€ = 112€/semaine de perte. Sur 40 agents, ça peut représenter 3000€+/semaine de trou. | Le moteur DOIT prioriser les agents sous-utilisés pour les remplacements. C'est le critère C8. |
| **Marge par poste** | `Marge = billedRate - hourlyRate - charges`. Le moteur doit favoriser les agents qui maximisent la marge, SAUF si ça compromet la qualité. | Score bonus financier optionnel : +5pts si la marge est ≥30%. |
| **Heures supplémentaires** | Au-delà du contrat, l'agent coûte plus cher (125% puis 150%). Le moteur doit EVITER de créer des heures sup sauf nécessité absolue. | Au-delà de `weeklyContractHours` : malus progressif. Au-delà de 48h : éliminatoire. |
| **Coût d'intérim** | Un intérimaire coûte ~1.5x un CDI pour la même prestation. Solution de dernier recours. | Si la seule solution est intérimaire : flag `highCostAlert`. |
| **Revenue récupéré** | Chaque poste non couvert = 0€ facturé au client + risque de pénalité contractuelle. L'IA qui comble un poste "récupère" du chiffre d'affaires. | Le dashboard doit afficher : "Revenue sauvé par l'IA cette semaine : X€". Déjà implémenté dans le Store. |

### Famille 7 : Formation & Anticipation des Risques

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Score de polyvalence** | Un agent formé sur 1 seul poste = risque 100%. S'il est absent, ce poste est en danger. L'IA doit calculer un "indice de fragilité" par poste. | `fragilityIndex = 1 / (backups formés + 1)`. Alerte si < 2 backups formés. |
| **Plan de formation proactif** | Si Priya a 7h libres cette semaine et que le poste Cargolux n'a qu'un seul backup → l'IA propose : "Former Priya sur Cargolux cette semaine (7h disponibles)". | Module de suggestion proactive basé sur `utilizationGap` × `fragilityIndex`. |
| **Formation = investissement ROI** | Chaque heure de formation coûte cher (salaire non facturé) mais rapporte gros (futur backup disponible). Le moteur calcule le ROI de chaque formation. | `ROI = (risque_couvert × coût_non_couverture) / coût_formation`. Les formations à haut ROI sont prioritaires. |
| **Shadowing obligatoire** | Sur certains postes complexes, un agent ne peut PAS y travailler seul avant X heures de shadowing accompagné. | `BackupTraining.status = 'IN_PROGRESS'` : l'agent peut être co-affecté en observation mais pas en remplacement solo. |
| **Expiration des compétences** | Si un agent n'a pas travaillé sur un poste depuis 6 mois, son niveau de formation se dégrade. Prévoir un "refresh". | Calcul `lastAssignmentDate` par poste. Si > 6 mois : status passe de `TRAINED` à `NEEDS_REFRESH`. L'IA planifie un rappel. |

### Famille 8 : Réglementaire & Légal (Luxembourg)

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Convention collective** | Selon la CCT applicable, les règles de repos, primes, heures de nuit, dimanche, jours fériés varient. | Table `LegalConstraint` configurable par pays/convention. |
| **Travail de nuit** | Poste après 22:00 : majoration + contraintes supplémentaires. Certains agents refusent. | `employee.acceptsNightShift: boolean`. Éliminatoire si false et poste de nuit. |
| **Travail dimanche/jours fériés** | Volontariat uniquement + majoration 100%. Le planning ne peut PAS forcer un dimanche. | Liste de volontaires pour weekends/fériés. Éliminatoire sinon. |
| **Équité de traitement** | Le moteur ne doit pas discriminer. Les critères doivent être objectifs et tracés. Chaque décision doit être expliquée. | L'IA génère un `reasoning: string` pour chaque score. Audit trail complet. |

### Famille 9 : Communication & Workflow

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Notification des assignations** | L'agent doit être prévenu au plus tôt. Idéalement J-1 pour les urgences, J-7 pour les plannings réguliers. | Système de notification intégré (email, SMS, push). |
| **Confirmation de l'agent** | L'agent doit CONFIRMER qu'il a reçu et accepte sa mission. Sans confirmation, le poste reste "à risque". | Status : `PENDING_CONFIRMATION → CONFIRMED → ON_SITE`. |
| **Notification au client** | Quand on change l'agent assigné, le client doit être informé. Surtout pour les clients `continuitySensitivity: HIGH`. | Email automatique au `ClientContact.isPrimary` avec le nom + photo du nouvel agent. |
| **Escalade** | Si aucun remplacement n'est trouvé en 1h pour un poste critique → alerte au Team Leader → escalade au directeur. | Chaîne d'escalade configurable par criticité de poste. |

### Famille 10 : Qualité & Boucle de Feedback Continu

| Contrainte | Détail | Impact IA |
|-----------|--------|-----------|
| **Satisfaction client** | Score de 1 à 5 après chaque mission. L'IA intègre ce feedback pour ajuster les futures suggestions. | `EmployeeClientAffinity` : monte (+1.5 si feedack ≥ 4), baisse (-3 si feedback ≤ 2). |
| **Incidents** | Retard, tenue non conforme, absence non justifiée, comportement inadéquat. | Chaque incident baisse le `reliabilityScore`. En dessous de 60 : alerte RH. |
| **KPIs moteur IA** | Taux de première suggestion acceptée. Taux top-3 acceptée. Revenue récupéré. Cascades moyennes. | Dashboard dédié "Santé du moteur IA" avec métriques en temps réel. |
| **Drift detection** | Si le taux d'acceptation baisse au fil du temps, l'IA dérive. Recalibrer les poids. | Alarme si `acceptanceRate < 60%` sur les 50 dernières décisions. |
| **NPS client** | Net Promoter Score mesuré trimestriellement. Corrélation avec la stabilité des affectations et la qualité des agents envoyés. | Dashboard exécutif : NPS par client, corrélé aux métriques de continuité. |

---

## PARTIE 2 — LES 16 CRITÈRES DE SCORING (v2 - Exhaustifs)

L'ancien moteur avait 8 critères. Voici les 16 critères nécessaires pour être **100% opérationnel**.

### Critères Éliminatoires (Gate Checks — si un seul échoue → score = 0, agent exclu)

| N° | Critère | Vérification | Logique |
|----|---------|-------------|---------|
| **E1** | Langue critique | `employee.lang[X].level ≥ post.minLevel[X]` | Le client exige un niveau minimum, pas juste la présence |
| **E2** | Compétences obligatoires | Chaque `requiredSkill` doit être possédée au bon niveau | Standard tél, protocole VIP, etc. |
| **E3** | Disponibilité horaire | Pas d'absence NI de shift existant qui chevauche le créneau demandé | Vérification `hasTimeConflict(existingShifts, requestedShift)` |
| **E4** | Repos légal 11h | `lastShiftEnd + 11h ≤ requestedShiftStart` | Code du Travail luxembourgeois |
| **E5** | Maximum heures jour (10h) | Cumul shifts du jour + nouveau shift ≤ 10h | Légal |
| **E6** | Maximum heures semaine (48h) | Cumul heures semaine + durée shift ≤ 48h | Légal absolu |
| **E7** | Blacklist client-employé | `ClientEmployeeBlacklist` n'a aucune entrée pour ce couple | Zéro tolérance |
| **E8** | Certification valide | Si le poste exige SST/SSIAP, la certification doit ne pas être expirée | `cert.expiresAt > today` |
| **E9** | Habilitation sécurité | `employee.clearanceLevel ≥ post.requiredClearance` | Sites sensibles |
| **E10** | Zone géographique | `post.zone ∈ employee.acceptedZones` | L'agent doit accepter de travailler dans cette zone |
| **E11** | 6 jours consécutifs | L'agent n'a pas travaillé les 6 derniers jours d'affilée | Repos hebdomadaire obligatoire |

### Critères Pondérés (Score — contribuent au classement final)

| N° | Critère | Calcul | Poids max |
|----|---------|--------|-----------|
| **P1** | Formation au poste | `TRAINED` = 30, `IN_PROGRESS` = 10, `TO_TRAIN/absent` = 0 | 30 pts |
| **P2** | Affinité client (feedback + historique) | `EmployeeClientAffinity.score` mappé de [-10,+10] vers [0,20] | 20 pts |
| **P3** | Continuité de service | L'agent était assigné au même poste la semaine dernière ? +15. Le mois dernier ? +8. Jamais ? 0. | 15 pts |
| **P4** | Équilibre de charge | `(contractHours - assignedHours) / contractHours × 15`. Plus il a d'heures libres, plus il est prioritaire. | 15 pts |
| **P5** | Fiabilité (reliabilityScore) | `reliabilityScore / 100 × 10`. Un agent fiable est préféré. | 10 pts |
| **P6** | Ancienneté / Maturité | `min(10, yearsOfService)`. Un agent senior a un avantage. | 10 pts |
| **P7** | Préférence nominative client | Le client a explicitement demandé cet agent ? +20 pts bonus. | Bonus hors barème |

**Score Total = Σ(P1..P6) sur 100 pts max + bonus P7**

---

## PARTIE 3 — LE CASCADE SOLVER (Algorithme de Réaffectation en Chaîne)

### Principe

```
Poste A (VIP) vacant → Meilleur candidat : Employé X (titulaire Poste B, standard)
  ↳ Poste B maintenant vacant → Meilleur candidat : Employé Y (backup, formé)
    ↳ Résultat : 2 mouvements, 0 poste non couvert, VIP servi par le meilleur profil
```

### Algorithme Pseudo-code

```
function solveCascade(vacantPost, date, allEmployees, maxDepth = 2):
  
  candidates = rankSuggestions(allEmployees, vacantPost, date)
  
  for candidate in candidates:
    if candidate.isAvailable():
      // Solution directe — pas de cascade nécessaire
      return { moves: [{ employee: candidate, to: vacantPost }], depth: 0 }
    
    if candidate.isAssignedElsewhere() AND depth < maxDepth:
      // Tenter de libérer le candidat en trouvant son remplaçant
      subResult = solveCascade(candidate.currentPost, date, 
                               allEmployees.exclude(candidate), maxDepth - 1)
      
      if subResult.success:
        return { 
          moves: [{ employee: candidate, from: candidate.currentPost, to: vacantPost },
                  ...subResult.moves],
          depth: subResult.depth + 1
        }
  
  // Aucune solution trouvée
  return { moves: [], depth: 0, uncoveredPosts: [vacantPost] }
```

### Règles de la Cascade

1. **Jamais déplacer un agent d'un poste VIP vers un poste STANDARD** (uniquement d'un STANDARD vers un VIP ou d'un STANDARD vers un PREMIUM)
2. **Pénalité de profondeur** : -5pts par niveau. Solution directe toujours préférée.
3. **Limite de profondeur** : Max 2 pour V1, potentiellement 3 en V2.
4. **Transaction atomique** : Tout ou rien. Si un maillon échoue, la cascade complète est annulée.
5. **Validation humaine obligatoire** : L'IA propose, l'opérateur approuve.

---

## PARTIE 4 — OPTIMISATION DES HEURES & FORMATION PROACTIVE

### Le Problème Central

> Un CDI payé 35h mais affecté 28h = **7h payées à ne rien faire** = 7 × 16€ = 112€/semaine × 52 = **5 824€/an de perte** par agent.  
> Sur 5 agents sous-utilisés, c'est **~30 000€/an** qui partent en fumée.

### Le Module "Idle Time Optimizer"

L'IA identifie chaque semaine les agents avec un `utilizationGap > 0` et propose automatiquement :

1. **Affectation supplémentaire** : "Priya a 7h libres et le poste House of Startups a besoin d'un renfort vendredi matin (4h)."
2. **Formation backup** : "Miangaly a 13h libres. Le poste Cargolux Standard n'a qu'1 backup formé (fragilité=50%). Planifier 8h de shadowing chez Cargolux."
3. **Refresh compétences** : "Catarina n'a pas travaillé chez Bank of China depuis 4 mois. Planifier 4h de refresh avant que ses compétences expirent."

### Calcul de Priorité des Formations

```
Training Priority Score = 
  (Fragility Index du poste × 40)     // Postes fragiles d'abord
+ (Employee Utilization Gap × 30)      // Agents sous-utilisés d'abord  
+ (Strategic Value du poste × 20)      // Postes à haute valeur d'abord
+ (Training Cost Efficiency × 10)      // Formations courtes d'abord

Fragility Index = 1 / (nombre de backups TRAINED + 1)
Strategic Value = clientPriority === 'VIP' ? 1 : clientPriority === 'PREMIUM' ? 0.6 : 0.3
Training Cost Efficiency = 1 - (estimatedTrainingHours / 40)
```

---

## PARTIE 5 — BOUCLE DE FEEDBACK & APPRENTISSAGE CONTINU

### 3 Mécanismes

#### 1. Ajustement des pondérations par client
Quand un opérateur refuse la suggestion #1 et choisit un autre candidat, le système compare les scores détaillés et ajuste les poids pour ce client :
- Learning rate : ±2% par feedback, décroissant avec la confiance
- Plafond : ±10% max d'écart par rapport aux poids par défaut
- Confiance stabilisée après 20 observations
- Stocké dans `ClientWeightOverride`

#### 2. Affinités employé ↔ client
Score de -10 à +10 par couple (employé, client) :
- Monte : choisi manuellement (+2), accepté IA (+1), bon feedback client (+1.5)
- Baisse : refusé (-1), mauvais feedback (-3), blacklisté (-10 / éliminatoire)
- Appliqué comme bonus/malus via critère P2
- Stocké dans `EmployeeClientAffinity`

#### 3. Rules Engine (Règles métier accumulées)
Table `BusinessRule` avec conditions JSON :
- Type `PREFERENCE` : soft, bonus/malus
- Type `CONSTRAINT` : hard, éliminatoire
- Exemples concrets du terrain :
  - "Ne jamais envoyer un junior chez PwC le lundi matin (pic de visiteurs)"
  - "Sophie +5 chez Bank of China (la directrice l'adore)"
  - "Pas de CDD chez ESM (exigence du contrat institutionnel)"

---

## PARTIE 6 — ALERTES & RAPPORTS PROACTIFS

### Alertes Automatiques

| Alerte | Déclencheur | Criticité |
|--------|------------|-----------|
| **Poste non couvert** | Aucun candidat éligible trouvé | 🔴 CRITIQUE |
| **Certification expire** | SST/SSIAP expire dans < 30 jours | 🟡 WARNING |
| **Agent sur-utilisé** | > 45h/semaine depuis 2 semaines | 🟡 WARNING |
| **Agent sous-utilisé** | < 50% d'utilisation depuis 2 semaines | 🟡 WARNING |
| **Poste fragile** | < 2 backups formés | 🟡 WARNING |
| **Pattern d'absence** | Même jour absent > 3 fois en 2 mois | 🟢 INFO |
| **Drift du moteur IA** | Taux acceptation #1 < 60% sur 50 décisions | 🟡 WARNING |
| **Compétence qui expire** | Agent pas assigné à un poste formé depuis > 6 mois | 🟢 INFO |
| **Conflit de planning** | Double affectation détectée (bug) | 🔴 CRITIQUE |
| **Non-confirmation agent** | Agent n'a pas confirmé sa mission H-2 | 🟡 WARNING |

### Rapport Hebdomadaire Automatique (Dimanche Soir)

Envoyé par email au Team Leader. Contenu :

1. **Risques de la semaine à venir** : Absences prévisibles, postes fragiles, agents proches du plafond d'heures
2. **Suggestions de formation** : Agents sous-utilisés × postes fragiles = opportunités de formation
3. **Bilan financier** : Revenue récupéré par l'IA, coût des heures non affectées, marge moyenne
4. **Santé du moteur** : Taux d'acceptation, drift, cascades déclenchées

---

## PARTIE 7 — MONITORING & MÉTRIQUES

### Performance

| Métrique | Seuil d'alerte | Cible |
|----------|---------------|-------|
| Temps de scoring p95 | > 500ms | < 200ms |
| Candidats éligibles par recherche | < 3 | ≥ 5 |
| Cascades déclenchées | > 20% des remplacements | < 10% |
| Temps de résolution moyen | > 2h | < 30min |

### Apprentissage

| Métrique | Seuil d'alerte | Cible |
|----------|---------------|-------|
| Taux acceptation #1 | < 60% après 3 mois | > 75% |
| Taux acceptation top 3 | < 85% | > 90% |
| Overrides manuels | > 30% | < 15% |
| Oscillation poids client | > 0.05/semaine | Stable |

### Business

| Métrique | Objectif |
|----------|---------|
| Taux d'occupation global | > 95% |
| Revenue récupéré vs perdu | Ratio > 10:1 |
| Coût moyen d'un remplacement | < 50€ de surcoût |
| Postes non couverts/semaine | 0 |

---

## PARTIE 8 — STACK TECHNIQUE & ROADMAP

### Stack

| Composant | Choix | Raison |
|-----------|-------|--------|
| Langage | TypeScript | Même stack front et back |
| Runtime | NestJS module dédié (`AiModule`) | DI, testable, modulaire |
| BDD | PostgreSQL (Prisma ou Drizzle) | Requêtes complexes, ACID, JSON support |
| Calcul | CPU natif | Arithmétique pondérée, pas besoin de GPU |
| Scheduler | `@nestjs/schedule` | Rapport hebdo, recalcul polyvalence chaque nuit |
| Cache | In-memory V1, Redis V2 | Scores polyvalence, poids par client |
| Tests | Vitest | Chaque critère unitairement testé |

### Roadmap d'Implémentation

| Phase | Contenu | Effort |
|-------|---------|--------|
| **Proto (Maintenant)** | 16 critères + cascade profondeur 1 + idle time optimizer (données statiques) | 2-3 jours |
| **V1 (Semaines 1-8)** | Backend NestJS, PostgreSQL, scoring complet, feedback loop, alertes | 15-16 jours |
| **V2 (Mois 3-6)** | Dashboard monitoring IA, business rules UI, Redis cache, notifications prédictives, NPS | 20 jours |
| **V3 (Mois 9-12)** | Prédiction absences (ML patterns), pré-positionnement auto, auto-tuning A/B, multi-langue app | 25 jours |

---

## CE QUI REND CE MOTEUR UNIQUE

1. **Modélisation métier ultra-profonde** : 16 critères qui reflètent 20 ans d'expérience terrain, pas un algorithme générique
2. **Transparence totale** : L'opérateur voit POURQUOI chaque agent est proposé. Confiance = adoption = valeur
3. **Boucle de feedback continue** : Après 100 décisions, le moteur connaît les préférences implicites de chaque client
4. **Anticipation** : Rapport de risque dimanche soir → proactivité vs mode pompier
5. **ROI mesurable** : Chaque euro récupéré est tracé. "L'IA vous a fait économiser 45 000€ cette année" = argument commercial imbattable
6. **Scalabilité du savoir** : Quand un nouvel opérateur arrive, la connaissance est dans le système, pas dans la tête de Mandy
7. **Conformité légale native** : Les contraintes du Code du Travail sont des critères éliminatoires, pas des options
8. **Formation comme investissement** : L'IA ne gère pas seulement les urgences, elle PRÉVIENT les crises en formant proactivement
