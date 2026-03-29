---
name: samsic-ai-scoring
description: "Moteur IA de scoring SAMSIC — 8 critères de sélection employé, cascade solver, learning engine. Utiliser pour toute implémentation ou modification du moteur de suggestion."
risk: safe
source: project-local
date_added: "2026-03-28"
---

# Samsic Accueil — Moteur IA de Scoring

> Source : `14-AI-ENGINE-DEEP-DIVE.md` + `04-AI-ENGINE.md`  
> Référence : @test-driven-development OBLIGATOIRE pour tout ce module  
> Cible perf : < 200ms pour 44 employés, < 1s pour cascade profondeur 2

---

## 1. Les 8 Critères de Scoring

| N° | Critère | Type | Poids défaut |
|----|---------|------|-------------|
| C1 | **Langue critique** (exigée par le client) | Éliminatoire | — |
| C2 | **Compétences requises** (ex: standard téléphonique) | Éliminatoire | — |
| C3 | **Disponibilité** (pas d'absence, pas de double affectation) | Éliminatoire | — |
| C4 | **Formation au poste** (titulaire ou backup formé) | Pondéré | 30 pts |
| C5 | **Historique client** (déjà travaillé avec ce client) | Pondéré | 25 pts |
| C6 | **Expérience poste** (nb de fois affecté à ce poste) | Pondéré | 20 pts |
| C7 | **Préférence employé** (préfère ce client) | Pondéré | 15 pts |
| C8 | **Équilibre charge** (nb heures cette semaine) | Pondéré | 10 pts |

**Score final = Σ(critères pondérés) / 100**

### Critères Éliminatoires (C1, C2, C3)
Si un critère éliminatoire n'est pas respecté → score = 0, employé exclu de la liste.

---

## 2. Interface TypeScript — Types

```typescript
// packages/shared/src/types/ai-engine.ts

export type LangueCode = 'fr' | 'en' | 'de' | 'lu' | 'pt';

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  languges: LangueCode[];
  skills: string[];
  trainedPostIds: string[];        // postes où formé
  preferredClientIds: string[];    // clients préférés
  weeklyHours: number;             // heures cette semaine
  absenceDates: string[];          // dates YYYY-MM-DD d'absence
  assignedDates: Record<string, string[]>; // date → postIds
}

export interface PostRequirements {
  id: string;
  clientId: string;
  requiredLanguages: LangueCode[];  // langues obligatoires
  requiredSkills: string[];
  criticalLanguage?: LangueCode;   // UNE langue absolument critique
}

export interface ScoringContext {
  employee: EmployeeProfile;
  post: PostRequirements;
  date: string; // YYYY-MM-DD
  clientHistory: Record<string, number>; // clientId → nb affectations passées
  postHistory: Record<string, number>;   // postId → nb affectations passées
}

export interface ScoreBreakdown {
  employeeId: string;
  totalScore: number;          // 0-100
  isEligible: boolean;         // false si critère éliminatoire échoue
  eliminationReason?: string;  // raison si non éligible
  criteria: {
    c4_training: number;       // 0 ou 30
    c5_clientHistory: number;  // 0-25
    c6_postExperience: number; // 0-20
    c7_preference: number;     // 0 ou 15
    c8_workloadBalance: number;// 0-10
  };
  confidence: number;          // 0-1, confiance dans le score
}

export interface SuggestionResult {
  post: PostRequirements;
  date: string;
  suggestions: ScoreBreakdown[];  // triées par totalScore desc
  hasCascade: boolean;            // si une cascade est possible
  cascadeDepth: number;           // profondeur de la cascade
  processingTimeMs: number;
}
```

---

## 3. Algorithme de Scoring

```typescript
// apps/web/lib/ai/scoring-engine.ts (prototype)
// apps/api/src/ai/scoring.service.ts (V1 NestJS)

function scoreEmployee(ctx: ScoringContext): ScoreBreakdown {
  const { employee, post, date, clientHistory, postHistory } = ctx;

  // === CRITÈRES ÉLIMINATOIRES ===

  // C1 - Langue critique
  if (post.criticalLanguage && !employee.languges.includes(post.criticalLanguage)) {
    return eliminated(employee.id, `Langue critique ${post.criticalLanguage} manquante`);
  }

  // C1 bis - Toutes langues requises
  const missingLanguages = post.requiredLanguages.filter(
    lang => !employee.languges.includes(lang)
  );
  if (missingLanguages.length > 0) {
    return eliminated(employee.id, `Langues manquantes: ${missingLanguages.join(', ')}`);
  }

  // C2 - Compétences requises
  const missingSkills = post.requiredSkills.filter(
    skill => !employee.skills.includes(skill)
  );
  if (missingSkills.length > 0) {
    return eliminated(employee.id, `Compétences manquantes: ${missingSkills.join(', ')}`);
  }

  // C3 - Disponibilité (absence)
  if (employee.absenceDates.includes(date)) {
    return eliminated(employee.id, `Absent le ${date}`);
  }

  // C3 bis - Double affectation (backups uniquement)
  const alreadyAssigned = employee.assignedDates[date] || [];
  if (alreadyAssigned.length > 0 && employee.employeeType !== 'BACKUP') {
    return eliminated(employee.id, `Déjà affecté le ${date}`);
  }

  // === CRITÈRES PONDÉRÉS ===

  // C4 - Formation au poste (30 pts)
  const c4 = employee.trainedPostIds.includes(post.id) ? 30 : 0;

  // C5 - Historique client (25 pts max)
  const clientAffectations = clientHistory[post.clientId] || 0;
  const c5 = Math.min(25, Math.floor(clientAffectations / 5) * 5);

  // C6 - Expérience poste (20 pts max)
  const postAffectations = postHistory[post.id] || 0;
  const c6 = Math.min(20, Math.floor(postAffectations / 3) * 4);

  // C7 - Préférence employé (15 pts)
  const c7 = employee.preferredClientIds.includes(post.clientId) ? 15 : 0;

  // C8 - Équilibre charge (10 pts max)
  // Moins d'heures = plus de points
  const c8 = Math.max(0, 10 - Math.floor(employee.weeklyHours / 4));

  const totalScore = c4 + c5 + c6 + c7 + c8;
  const confidence = calculateConfidence(clientAffectations, postAffectations);

  return {
    employeeId: employee.id,
    totalScore,
    isEligible: true,
    criteria: { c4_training: c4, c5_clientHistory: c5, c6_postExperience: c6, c7_preference: c7, c8_workloadBalance: c8 },
    confidence,
  };
}

function eliminated(employeeId: string, reason: string): ScoreBreakdown {
  return {
    employeeId,
    totalScore: 0,
    isEligible: false,
    eliminationReason: reason,
    criteria: { c4_training: 0, c5_clientHistory: 0, c6_postExperience: 0, c7_preference: 0, c8_workloadBalance: 0 },
    confidence: 1,
  };
}

function calculateConfidence(clientAffectations: number, postAffectations: number): number {
  // Confiance augmente avec l'historique
  const historyScore = Math.min(1, (clientAffectations + postAffectations) / 20);
  return Math.round(historyScore * 100) / 100;
}
```

---

## 4. Cascade Solver

La cascade permet de réaffecter une chaîne d'employés pour combler un poste.

```
Exemple :
Poste A vacant → Meilleur candidat : Employé X (déjà sur Poste B)
  ↳ Poste B maintenant vacant → Meilleur candidat : Employé Y (backup formé)
    ↳ Résultat : 2 déplacements, 0 poste non couvert
```

```typescript
interface CascadeResult {
  moves: Array<{
    employeeId: string;
    fromPostId: string | null;
    toPostId: string;
    date: string;
  }>;
  depth: number;
  uncoveredPosts: string[];
}

async function solveCascade(
  vacantPostId: string,
  date: string,
  allEmployees: EmployeeProfile[],
  maxDepth: number = 2
): Promise<CascadeResult>;
```

---

## 5. Learning Engine — Boucle de feedback

Chaque décision accepter/refuser met à jour les poids.

```typescript
interface FeedbackEvent {
  suggestionId: string;
  employeeId: string;
  postId: string;
  date: string;
  action: 'ACCEPTED' | 'REFUSED';
  refusalReason?: 'LANGUAGE' | 'SKILL' | 'PREFERENCE' | 'WORKLOAD' | 'OTHER';
  timestamp: Date;
}

// Ajustement des poids après N refus consécutifs
function adjustWeights(feedbackHistory: FeedbackEvent[]): WeightAdjustment;
```

---

## 6. TDD — Tests Obligatoires

> **@test-driven-development** : CHAQUE CRITÈRE doit avoir son test avant l'implémentation.

```typescript
// Tests minimaux requis :
describe('ScoreEngine', () => {
  test('élimine un employé sans la langue critique')
  test('élimine un employé absent à la date')
  test('donne 30 pts si formé au poste')
  test('donne 0 pt si backup non formé')
  test('calcule correctement le score total pour Mandy (profil réel)')
  test('retourne les suggestions triées par score décroissant')
  test('respecte la limite 200ms pour 44 employés')
  test('cascade profondeur 1 fonctionne')
  test('cascade profondeur 2 fonctionne')
})
```

---

## 7. Emplacement dans le monorepo

```
Proto (statique) :
  apps/web/lib/ai/scoring-engine.ts
  apps/web/lib/ai/cascade-solver.ts
  apps/web/lib/ai/__tests__/scoring.test.ts

V1 (NestJS) :
  apps/api/src/ai/ai.module.ts
  apps/api/src/ai/scoring.service.ts
  apps/api/src/ai/cascade.service.ts
  apps/api/src/ai/learning.service.ts
  apps/api/src/ai/__tests__/scoring.spec.ts
```

## When to Use
Utiliser ce skill pour implémenter, modifier ou débugger le moteur de scoring IA.
Toujours combiner avec @test-driven-development.
