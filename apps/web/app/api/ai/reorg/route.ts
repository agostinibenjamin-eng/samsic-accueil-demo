/**
 * GET /api/ai/reorg — Analyse du planning et suggestions de réorganisation
 * @samsic-ai-scoring — Cascade solver, critères 8 points
 * @nextjs-best-practices — Route Handler App Router
 * @samsic-demo-scenario — Données démo réalistes pour scénario CEO
 */
import { NextRequest, NextResponse } from 'next/server';

export interface ReorgSuggestion {
  id: string;
  type: 'REPLACE' | 'SHIFT' | 'OPTIMIZE' | 'ALERT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  detail: string;
  impact: string;
  score: number; // Score IA de la suggestion (0-100)
  affectedPosts: string[];
  affectedEmployees: string[];
  estimatedSaving?: string; // Ex: "3h de perturbation évitées"
  action?: string; // Texte du bouton
}

// Suggestions démo réalistes — scénario semaine 28 mars-3 avril 2026
const DEMO_SUGGESTIONS: ReorgSuggestion[] = [
  {
    id: 'reorg-1',
    type: 'REPLACE',
    priority: 'HIGH',
    title: 'Réaffectation en chaîne — Bank of China Rép. A',
    description: 'Couvrir l\'absence de Maria Dobrinescu (Rép. A) en déplaçant Catarina Mateus de Rép. B vers Rép. A (plus exigeante), et affecter Priya Nair sur Rép. B (formée, score 82).',
    detail: 'Maria Dobrinescu (Rép. A · 8h30-17h30) absente mardi 29 mars.\n→ Catarina Mateus (Rép. B) maîtrise FR/EN/DE — poste compatible (score : 91/100)\n→ Priya Nair disponible, formée Rép. B (score : 82/100)\nImpact : 0 perturbation client, couverture continue.',
    impact: 'Poste couvert à 91/100 — Bank of China satisfait',
    score: 91,
    affectedPosts: ['Bank of China · Réception A', 'Bank of China · Réception B'],
    affectedEmployees: ['Catarina Mateus', 'Priya Nair'],
    estimatedSaving: '1 alerte critique résolue',
    action: 'Appliquer la réaffectation',
  },
  {
    id: 'reorg-2',
    type: 'REPLACE',
    priority: 'HIGH',
    title: 'Couverture Cargolux Réception Matin (6h-14h)',
    description: 'Le poste Cargolux Réception Matin est non couvert toute la semaine. Ana Luisa (backup disponible, FR/EN) peut couvrir le créneau matin avec formation accélérée (2h).',
    detail: 'Cargolux · Réception Matin · 6h-14h — aucun titulaire.\n→ Ana Luisa : disponible, horaires flexibles, profil FR/EN (score : 67/100)\nNote : score inférieur au seuil idéal (75) — formation de 2h recommandée avant affectation.',
    impact: 'Poste couvert à 67/100 — risque contractuel évité',
    score: 67,
    affectedPosts: ['Cargolux · Réception Matin'],
    affectedEmployees: ['Ana Luisa'],
    estimatedSaving: 'Contractuel : pénalité SLA évitée',
    action: 'Planifier avec formation',
  },
  {
    id: 'reorg-3',
    type: 'SHIFT',
    priority: 'MEDIUM',
    title: 'Équilibrage charge — Karim Ghazi (ING · 42h)',
    description: 'Karim atteint 42h cette semaine (ING · Réception 7h30-17h · 5j). Rotation recommandée lundi/vendredi avec Nadia Tahri pour équilibrer à 37h.',
    detail: 'Karim Ghazi : ING Réception · 7h30-17h · 5 jours = 47,5h brut (pauses déduites : ~42h).\nSeuil légal recommandé : 40h. Risque heures supplémentaires.\n→ Nadia Tahri (ING Standard) peut couvrir Réception lundi et vendredi matin.\nBénéfice : charge équilibrée, Karim à 37h, Nadia à 39h.',
    impact: 'Karim : 42h → 37h · Nadia : 35h → 39h',
    score: 78,
    affectedPosts: ['ING · Réception Principale', 'ING · Standard Téléphonique'],
    affectedEmployees: ['Karim Ghazi', 'Nadia Tahri'],
    estimatedSaving: '5h de dépassement évitées',
    action: 'Planifier la rotation',
  },
  {
    id: 'reorg-4',
    type: 'OPTIMIZE',
    priority: 'MEDIUM',
    title: 'Synergie géographique — Kirchberg cluster (3 clients)',
    description: 'Chambre de Commerce, ESM et Mitsubishi sont dans un périmètre de 800m. Mutualiser les backups de ces 3 clients permettrait une rotation plus fluide en cas d\'absence.',
    detail: 'Chambre de Commerce · ESM · Mitsubishi = cluster Kirchberg (< 800m).\nSituation actuelle : 3 pools de backup indépendants (9 backups au total, mais peu flexibles).\n→ Créer un pool commun Kirchberg (3 agents polyvalents formés sur les 3 sites) permettrait de réduire le risque de 40%.\nProposition : Former Paulo Pereira (CC) sur ESM et Mitsubishi (2 jours de formation).',
    impact: 'Taux couverture cluster +8% estimé',
    score: 74,
    affectedPosts: ['Chambre de Commerce', 'ESM · Accueil', 'Mitsubishi · Réception'],
    affectedEmployees: ['Paulo Pereira', 'Rebecca Basse', 'Ophélie Collin'],
    estimatedSaving: 'Formation 2 jours → ROI sur 6 mois',
    action: 'Planifier les formations',
  },
  {
    id: 'reorg-5',
    type: 'ALERT',
    priority: 'MEDIUM',
    title: 'Certification Karim Ghazi — expiration J-12',
    description: 'La certification accueil VIP de Karim Ghazi expire dans 12 jours (09/04/2026). Sans renouvellement, il ne peut plus couvrir le poste ING Accueil VIP.',
    detail: 'Certification : Accueil VIP institutionnel (ING Banking)\nExpiration : 09 avril 2026 (J-12)\nImpact si non renouvelé : Karim ne peut plus couvrir ING · Accueil VIP · 9h-17h\nAction requise : RH → planifier session de renouvellement avant le 05/04.',
    impact: 'Sans action : ING Accueil VIP non couvert après le 9 avril',
    score: 55,
    affectedPosts: ['ING · Accueil VIP'],
    affectedEmployees: ['Karim Ghazi'],
    estimatedSaving: 'Alerte préventive — action RH requise',
    action: 'Notifier RH',
  },
  {
    id: 'reorg-6',
    type: 'OPTIMIZE',
    priority: 'LOW',
    title: 'Optimisation créneaux Amazon JLL — réduction trajet',
    description: 'Lucas Donis (Amazon · 7h-15h) et Mauro Tavares (Amazon Mailroom · 8h-16h) habitent le même secteur. Possibilité de covoiturage ou décalage de 30min pour optimiser.',
    detail: 'Lucas Donis : Amazon Réception · 7h-15h · secteur Bonnevoie\nMauro Tavares : Amazon Mailroom · 8h-16h · secteur Bonnevoie\nSite Amazon : Leudelange (25 min)\n→ Covoiturage = -50% déplacements · Décalage 30min Lucas (7h30) = trajets identiques\nImpact RH positif, améliore satisfaction employés.',
    impact: 'Bien-être employés · -30min transport/jour',
    score: 42,
    affectedPosts: ['Amazon · Réception Principale', 'Amazon · Mailroom'],
    affectedEmployees: ['Lucas Donis', 'Mauro Tavares'],
    estimatedSaving: 'Satisfaction employés',
    action: 'Proposer aux employés',
  },
];

export async function GET(req: NextRequest) {
  const weekStart = req.nextUrl.searchParams.get('weekStart') || '2026-03-28';

  // Simuler un délai d'analyse IA (en prod: scoring réel via prisma + algorithme)
  await new Promise(r => setTimeout(r, 150));

  const summary = {
    weekStart,
    analyzedAt: new Date().toISOString(),
    totalPostsAnalyzed: 35,
    totalEmployeesAnalyzed: 44,
    suggestionCount: DEMO_SUGGESTIONS.length,
    highPriorityCount: DEMO_SUGGESTIONS.filter(s => s.priority === 'HIGH').length,
    estimatedImpact: '2 postes critiques couverts · 5h dépassement évitées · 1 alerte RH',
    suggestions: DEMO_SUGGESTIONS,
  };

  return NextResponse.json(summary);
}
