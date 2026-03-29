/**
 * GET /api/alerts — Alertes unifiées (couverture + turnover + fragilité + certifications)
 * GET /api/alerts?summary=true — Compte seulement (Dashboard KPI)
 * 
 * Sources :
 *  - Alertes planning classiques (postes non couverts, absences)
 *  - Alertes turnover IA v2 (CDD expirant, départs, certif expirantes)
 *  - Alertes fragilité postes (Idle Optimizer)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type AlertSeverityKey = 'CRITICAL' | 'WARNING' | 'INFO';
type AlertCategory = 'ABSENCE' | 'COVERAGE' | 'TURNOVER' | 'FRAGILITY' | 'CERTIFICATION' | 'LEGAL';

interface AlertV2 {
  id: string;
  severity: AlertSeverityKey;
  category: AlertCategory;
  title: string;
  description: string;
  clientId: string | null;
  postId: string | null;
  employeeId: string | null;
  date: string | null;
  isResolved: boolean;
  createdAt: string;
  action?: {
    label: string;
    href: string;
  };
  aiContext?: {
    engineVersion: string;
    candidatesFound: number;
    topScore: number;
  };
}

// ─── Alertes v2 enrichies ────────────────────────────────────────────────────

const DEMO_ALERTS_V2: AlertV2[] = [
  // ── CRITIQUES ──
  {
    id: 'v2-1',
    severity: 'CRITICAL',
    category: 'ABSENCE',
    title: 'Absence non remplacée — Maria Dobrinescu',
    description: 'Bank of China · Réception A · Mardi 29 Mars. Aucun backup confirmé. Le moteur IA v2.0 a identifié 3 candidats éligibles (16 critères).',
    clientId: 'bank-of-china',
    postId: 'bank-of-china--reception-a',
    employeeId: 'maria-dobrinescu',
    date: '2026-03-29',
    isResolved: false,
    createdAt: new Date('2026-03-28T07:12:00').toISOString(),
    action: { label: 'Voir le planning', href: '/planning' },
    aiContext: { engineVersion: 'v2.0', candidatesFound: 3, topScore: 76 },
  },
  {
    id: 'v2-2',
    severity: 'CRITICAL',
    category: 'COVERAGE',
    title: 'Poste non couvert — Cargolux Réception B',
    description: 'Cargolux · Réception B · Semaine entière. Aucun titulaire affecté. Cascade Solver activé : aucune solution trouvée (0 backup formé). Taux couverture client : 60%.',
    clientId: 'cargolux',
    postId: 'cargolux--reception-b',
    employeeId: null,
    date: '2026-03-28',
    isResolved: false,
    createdAt: new Date('2026-03-28T06:00:00').toISOString(),
    action: { label: 'Affecter un agent', href: '/planning' },
  },

  // ── WARNINGS ──
  {
    id: 'v2-3',
    severity: 'WARNING',
    category: 'TURNOVER',
    title: 'CDD expirant — Nina Koch (J-45)',
    description: 'Contrat CDD expire le 12 Mai 2026. Postes impactés : BGL BNP Paribas (Standard Téléphonique), Arendt (Réception backup). Prévoir renouvellement ou recrutement.',
    clientId: null,
    postId: null,
    employeeId: 'nina-koch',
    date: '2026-05-12',
    isResolved: false,
    createdAt: new Date('2026-03-28T07:00:00').toISOString(),
    action: { label: 'Voir la fiche', href: '/employees' },
  },
  {
    id: 'v2-4',
    severity: 'WARNING',
    category: 'COVERAGE',
    title: 'Couverture dégradée — ING Luxembourg',
    description: 'ING · Standard Téléphonique · Jeu-Ven. Backup non formé affecté (score IA: 61/100, P1 Formation = 0/30). Formation recommandée pour sécuriser le poste.',
    clientId: 'ing',
    postId: 'ing--standard-telephonique',
    employeeId: null,
    date: '2026-03-31',
    isResolved: false,
    createdAt: new Date('2026-03-28T08:30:00').toISOString(),
    action: { label: 'Traiter', href: '/planning' },
    aiContext: { engineVersion: 'v2.0', candidatesFound: 1, topScore: 61 },
  },
  {
    id: 'v2-5',
    severity: 'WARNING',
    category: 'LEGAL',
    title: 'Dépassement 48h/sem prévu — Jessica Santos',
    description: 'Si l\'affectation Generali Réception VIP vendredi est confirmée, Jessica atteindra 50h cette semaine (max légal: 48h). Le moteur IA a bloqué automatiquement cette affectation.',
    clientId: 'generali',
    postId: 'generali--reception-vip',
    employeeId: 'jessica-santos',
    date: '2026-04-01',
    isResolved: false,
    createdAt: new Date('2026-03-28T09:15:00').toISOString(),
  },

  // ── INFO ──
  {
    id: 'v2-6',
    severity: 'INFO',
    category: 'FRAGILITY',
    title: 'Poste fragile — Generali Réception VIP',
    description: 'Indice de fragilité 85%. Seulement 1 backup formé (Mandy De Melo). L\'Idle Optimizer recommande : former Priya Nair (ROI estimé: 4.2x, coût: 16h formation).',
    clientId: 'generali',
    postId: 'generali--reception-vip',
    employeeId: null,
    date: '2026-04-01',
    isResolved: false,
    createdAt: new Date('2026-03-28T09:30:00').toISOString(),
    action: { label: 'Planifier formation', href: '/planning' },
  },
  {
    id: 'v2-7',
    severity: 'INFO',
    category: 'CERTIFICATION',
    title: 'Certification expirée — Mandy De Melo (SST)',
    description: 'Certification SST expirée depuis le 15/01/2025. Mandy est Team Leader et référente qualité. Impact potentiel sur les postes VIP nécessitant SST active.',
    clientId: null,
    postId: null,
    employeeId: 'mandy-de-melo',
    date: '2025-01-15',
    isResolved: false,
    createdAt: new Date('2026-03-28T09:00:00').toISOString(),
    action: { label: 'Voir la fiche', href: '/employees' },
  },
  {
    id: 'v2-8',
    severity: 'INFO',
    category: 'FRAGILITY',
    title: 'Optimisation charge — 5 agents sous-utilisés',
    description: '35h non prestées cette semaine (coût: 560€). Agents concernés : Maria Dobrinescu (35h libres), Miangaly Rakotomalala (21h), Kiu Man (14h). Formations proactives recommandées.',
    clientId: null,
    postId: null,
    employeeId: null,
    date: null,
    isResolved: false,
    createdAt: new Date('2026-03-28T10:00:00').toISOString(),
    action: { label: 'Voir les détails', href: '/employees' },
  },
];

// ─── Route Handlers ──────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const summary = req.nextUrl.searchParams.get('summary') === 'true';
    const categoryFilter = req.nextUrl.searchParams.get('category');
    
    const dbAlerts = await prisma.alert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' }
    });
    
    let alerts: AlertV2[] = dbAlerts.map(a => {
      let cat: AlertCategory = 'COVERAGE';
      const t = a.title.toLowerCase();
      if (t.includes('absence')) cat = 'ABSENCE';
      else if (t.includes('cdd') || t.includes('turnover') || t.includes('expire')) cat = 'TURNOVER';
      else if (t.includes('fragil')) cat = 'FRAGILITY';
      else if (t.includes('certif')) cat = 'CERTIFICATION';

      return {
        id: a.id,
        severity: a.severity as AlertSeverityKey,
        category: cat,
        title: a.title,
        description: a.description,
        clientId: a.clientId,
        postId: a.postId,
        employeeId: null, // Model doesn't have employeeId currently
        date: a.date ? a.date.toISOString() : null,
        isResolved: a.isResolved,
        createdAt: a.createdAt.toISOString()
      };
    });
    
    // Filtrer par catégorie si demandé
    if (categoryFilter) {
      alerts = alerts.filter(a => a.category === categoryFilter.toUpperCase());
    }

    if (summary) {
      const total = alerts.length;
      const critical = alerts.filter(a => a.severity === 'CRITICAL').length;
      const warning = alerts.filter(a => a.severity === 'WARNING').length;
      const turnover = alerts.filter(a => a.category === 'TURNOVER').length;
      return NextResponse.json({ total, critical, warning, turnover });
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[API /alerts] Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    
    await prisma.alert.update({
      where: { id },
      data: { isResolved: true }
    });

    return NextResponse.json({ id, isResolved: true });
  } catch (error) {
    console.error('[API /alerts PATCH] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
