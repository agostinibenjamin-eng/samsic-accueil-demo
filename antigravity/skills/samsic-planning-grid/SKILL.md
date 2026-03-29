---
name: samsic-planning-grid
description: "Grille de planning matriciel SAMSIC — clients x jours, codes couleur métier, mode simulation. Utiliser pour implémenter ou modifier le planning interactif."
risk: safe
source: project-local
date_added: "2026-03-28"
---

# Samsic Accueil — Planning Matriciel

> Référence : `07-DASHBOARD.md`, `09-DESIGN-SYSTEM.md`  
> Skills complémentaires : @samsic-design-system, @react-patterns, @frontend-design

---

## 1. Structure de la Grille

```
┌──────────────────────────────────────────────────────┐
│  PLANNING HEBDOMADAIRE — Semaine du 28 Mars 2026     │
│  [Mode Normal ▼]  [← Semaine]  [Semaine →]          │
├──────────┬─────┬─────┬─────┬─────┬─────┬─────┬──────┤
│ CLIENT   │ LUN │ MAR │ MER │ JEU │ VEN │ SAM │ DIM  │
├──────────┼─────┼─────┼─────┼─────┼─────┼─────┼──────┤
│ Bank of  │ MD  │ MD  │ JS  │ MD  │ MD  │ —   │  —   │
│ China    │ ✓   │ ⚠   │ ●   │ ✓   │ ✓   │     │      │
├──────────┼─────┼─────┼─────┼─────┼─────┼─────┼──────┤
│ Amazon   │ T1  │ T1  │ ?   │ T1  │ T1  │ —   │  —   │
│          │ ✓   │ ✓   │ ✗   │ ✓   │ ✓   │     │      │
└──────────┴─────┴─────┴─────┴─────┴─────┴─────┴──────┘

Légende cellule :
  MD = Initiales employé
  ✓ = Titulaire confirmé (vert)
  ⚠ = Backup formé (bleu)
  ● = Backup à former (orange)
  ✗ = Non couvert (rouge)
  — = Weekend/Fermé (gris)
```

---

## 2. Props du Composant Principal

```tsx
// apps/web/components/planning/PlanningGrid.tsx

interface PlanningGridProps {
  weekStart: Date;                    // Lundi de la semaine affichée
  clients: Client[];                   // 17 clients
  assignments: AssignmentMap;          // map[clientId][date] = Assignment
  isSimulation?: boolean;              // mode simulation actif
  onCellClick: (clientId: string, date: string) => void;  // ouvre le panneau IA
  onAssignmentChange?: (change: AssignmentChange) => void; // drag & drop
}

interface AssignmentMap {
  [clientId: string]: {
    [dateString: string]: CellData; // YYYY-MM-DD
  };
}

interface CellData {
  employeeId: string | null;
  employeeInitials: string | null;
  status: 'CONFIRMED' | 'TRAINED_BACKUP' | 'UNTRAINED_BACKUP' | 'UNCOVERED' | 'CLOSED';
  isSimulation?: boolean; // si cette affectation est simulée
}
```

---

## 3. Code couleur des cellules (SAMSIC officiel)

```tsx
// apps/web/components/planning/CellStyles.ts

const CELL_STYLES = {
  CONFIRMED: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    border: '#2E7D32',
    icon: '✓',
    label: 'Titulaire confirmé',
  },
  TRAINED_BACKUP: {
    bg: '#cce3f0',
    text: '#0078b0',
    border: '#0078b0',
    icon: '●',
    label: 'Backup formé',
  },
  UNTRAINED_BACKUP: {
    bg: '#FFF3E0',
    text: '#E87A1E',
    border: '#E87A1E',
    icon: '⚠',
    label: 'Backup à former',
  },
  UNCOVERED: {
    bg: '#FFEBEE',
    text: '#C62828',
    border: '#C62828',
    icon: '✗',
    label: 'Non couvert',
  },
  CLOSED: {
    bg: '#f5f5f5',
    text: '#999ea3',
    border: '#c2c4c7',
    icon: '—',
    label: 'Weekend / Fermé',
  },
  // Toutes les cellules en mode simulation
  SIMULATION_OVERLAY: {
    bg: '#F3E5F5',
    text: '#6B21A8',
    border: '#6B21A8',
  },
} as const;
```

---

## 4. Bandeau Mode Simulation

```tsx
// Affiché en haut de la grille si isSimulation = true
const SimulationBanner = () => (
  <div className="bg-simulation text-white text-center py-2 px-4 font-body font-bold text-sm flex items-center justify-center gap-3">
    <span className="animate-pulse">◉</span>
    MODE SIMULATION — Les modifications ne sont pas sauvegardées
    <button 
      onClick={exitSimulation}
      className="ml-4 bg-white text-simulation px-3 py-1 text-xs font-bold hover:bg-simulation-bg transition-colors"
    >
      Quitter la simulation
    </button>
  </div>
);
```

---

## 5. Interaction Cellule → Panneau IA

Cliquer sur une cellule ouvre le panneau latéral de suggestions IA :

```tsx
// Cellule vide (UNCOVERED) → Ouvre suggestions IA pour ce poste/date
// Cellule remplie → Affiche les détails + option "Changer"
// Cellule en simulation → Affiche "Appliquer cette suggestion"

const handleCellClick = (clientId: string, date: string, currentData: CellData) => {
  if (currentData.status === 'UNCOVERED') {
    openAISuggestionPanel({ clientId, date, mode: 'ASSIGN' });
  } else {
    openAISuggestionPanel({ clientId, date, mode: 'REVIEW', currentAssignment: currentData });
  }
};
```

---

## 6. Navigation Temporelle

```tsx
// Contrôles de navigation semaine
interface WeekNavigatorProps {
  currentWeek: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onTodayClick: () => void;
}

// Format affiché : "Semaine du 28 Mars → 3 Avril 2026"
// Raccourcis : ← → pour navigation clavier
```

---

## 7. Filtres Disponibles

```tsx
// Filtres affichés au-dessus de la grille
interface PlanningFilters {
  showClients: string[];    // défaut : tous les 17 clients
  showWeekend: boolean;     // défaut : false (SAM/DIM cachés)
  highlightUncovered: boolean; // défaut : true
  groupByIndustry: boolean; // défaut : false
}
```

---

## 8. Données Seed pour le Prototype

```typescript
// apps/web/data/planning-seed.ts
// Semaine du 28 Mars 2026 — Données simulées réalistes

export const weekplanningData: AssignmentMap = {
  // 17 clients avec affectations réalistes
  // Inclure au moins 2 postes non couverts pour la démo
  // Inclure 3 backups formés et 2 backups à former
  // Mandy et Jessica sur leurs postes habituels
};
```

---

## 9. Performance

- **Virtualisation** : si > 20 clients, utiliser `react-window` pour les lignes
- **Memoization** : `React.memo` sur chaque cellule individuelle
- **Pas de re-render** : uniquement les cellules modifiées lors du drag & drop

## When to Use
Utiliser ce skill pour implémenter ou modifier la grille de planning matriciel.
Toujours combiner avec @samsic-design-system pour les couleurs et @react-patterns pour les composants.
