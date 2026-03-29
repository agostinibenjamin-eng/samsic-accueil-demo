/**
 * page.tsx — Dashboard Exécutif Samsic Accueil
 * @samsic-design-system — Tous les composants conformes au design system
 * @nextjs-best-practices — Server Component, alertes statiques (no localhost fetch)
 */
import {
  Users, CheckSquare, BellRing,
  CalendarDays, Clock, Star,
} from 'lucide-react';
import { HeroMetrics } from '@/components/dashboard/HeroMetrics';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { AlertWidget, type AlertItem } from '@/components/dashboard/AlertWidget';
import { CoverageChart } from '@/components/dashboard/CoverageChart';
import { ClientRankingTable } from '@/components/dashboard/ClientRankingTable';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { PerformanceIA } from '@/components/dashboard/PerformanceIA';
import { AIInsightsWidget } from '@/components/dashboard/AIInsightsWidget';
import { PrintButton } from '@/components/ui/PrintButton';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Génère les données historiques de manière déterministe (pour le composant de vue semaine)
function buildHistoricalData(period: string, realCoverageRate: number) {
  const daysCount = period === 'mois' ? 30 : period === 'trimestre' ? 90 : 365;
  return Array.from({ length: daysCount }, (_, i) => {
    let baseRate = realCoverageRate;
    if (i % 7 === 5 || i % 7 === 6) baseRate = 100; // Weekends
    const variation = Math.sin(i * 1.7) * 3;
    const coverageRate = Math.min(100, Math.max(80, Math.floor(baseRate + variation)));
    return {
      day: `J-${daysCount - i}`,
      coveredPosts: Math.floor((coverageRate / 100) * 21),
      totalPosts: 21,
      coverageRate,
      isToday: false,
    };
  });
}

// ══════════════════════════════════════════════════════════
//  PAGE
// ══════════════════════════════════════════════════════════
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { period?: string; date?: string };
}) {
  const selectedPeriod = searchParams?.period || 'semaine';
  const targetDateStr = searchParams?.date || '2026-03-28';
  
  const weekStart = new Date(targetDateStr);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Prisma queries for real metrics
  const [dbAlerts, activePostsCount, assignments] = await Promise.all([
    prisma.alert.findMany({ 
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count({ where: { isActive: true } }),
    prisma.assignment.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd }
      }
    })
  ]);

  // Alert mapping
  const alerts: AlertItem[] = dbAlerts.map(a => ({
    id: a.id,
    severity: a.severity as 'CRITICAL' | 'WARNING' | 'INFO',
    title: a.title,
    description: a.description,
    date: a.date ? a.date.toISOString() : null,
  }));

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  // Calculs KPI
  const totalPostsForWeek = activePostsCount * 5; // Approx 5 jours (Lun-Ven)
  const coveredPostsCount = assignments.length;
  const uncoveredPostsCount = Math.max(0, totalPostsForWeek - coveredPostsCount);
  
  const coverageRate = totalPostsForWeek > 0 ? (coveredPostsCount / totalPostsForWeek) * 100 : 100;
  
  const aiValidationsCount = assignments.filter(a => a.aiSuggested).length;
  const savings = aiValidationsCount * 45; // Métrique estimée ROI: 45€ par appel IA évité/optimisé

  // Données couverture dynamique selon la période
  const coverageChartData =
    selectedPeriod === 'semaine'
      ? [
          { day: 'Lun 28', coveredPosts: coveredPostsCount / 5, totalPosts: activePostsCount, coverageRate, isToday: true },
          { day: 'Mar 29', coveredPosts: coveredPostsCount / 5, totalPosts: activePostsCount, coverageRate, isToday: false },
          { day: 'Mer 30', coveredPosts: coveredPostsCount / 5, totalPosts: activePostsCount, coverageRate, isToday: false },
          { day: 'Jeu 31', coveredPosts: coveredPostsCount / 5, totalPosts: activePostsCount, coverageRate, isToday: false },
          { day: 'Ven 01', coveredPosts: coveredPostsCount / 5, totalPosts: activePostsCount, coverageRate, isToday: false },
        ]
      : buildHistoricalData(selectedPeriod, coverageRate);

  const kpi = { totalPosts: totalPostsForWeek, coveredPosts: coveredPostsCount, uncoveredPosts: uncoveredPostsCount };

  const todayDate = new Date(targetDateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex h-full w-full overflow-hidden print:overflow-visible print:bg-white">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-body font-extrabold text-samsic-marine">
                Dashboard Exécutif
              </h1>
              <p suppressHydrationWarning className="text-sm text-samsic-marine-50 font-body mt-1 capitalize">
                {todayDate}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <PeriodSelector />
              <PrintButton />
              <Link
                href="/planning"
                className="flex items-center gap-2 bg-samsic-marine text-white px-4 py-2 text-sm font-body font-semibold tracking-wide hover:bg-samsic-marine-80 transition-colors shadow-sm print:hidden"
              >
                <CalendarDays size={16} />
                Voir le planning
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Hero Metrics — 5 stat cards avec sparklines */}
          <section aria-label="Indicateurs clés CEO">
            <HeroMetrics 
              coverageRate={coverageRate}
              savings={savings}
              aiValidationsCount={aiValidationsCount}
              totalValidationsCount={totalPostsForWeek}
            />
          </section>

          {/* Graphique + Alertes */}
          <section aria-label="Vue semaine et alertes" className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 relative">
              <CoverageChart data={coverageChartData} />
            </div>
            <div>
              <AlertWidget alerts={alerts} />
            </div>
          </section>

          {/* Performance semaine (IA) */}
          <section aria-label="Performance de l'Intelligence Artificielle" className="w-full">
            <PerformanceIA />
          </section>

          {/* Top clients + Actions rapides */}
          <section aria-label="Couverture clients et actions" className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <ClientRankingTable />
            </div>

            {/* Actions rapides + Insights IA */}
            <div className="bg-white border border-samsic-sable-50 shadow-sm flex flex-col gap-0">
              {/* Insights IA Widget (client component) */}
              <AIInsightsWidget />

              {/* Actions rapides */}
              <div className="border-t border-[#d5d0c8]">
                <div className="px-5 py-3 border-b border-[#d5d0c8]">
                  <h2 className="text-sm font-body font-bold text-[#0A0A0A]">Actions rapides</h2>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <Link
                    href="/planning"
                    className="flex items-center gap-3 px-4 py-3 border border-samsic-sable-50 hover:border-samsic-marine hover:bg-samsic-sable-30 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-samsic-sable-30 flex items-center justify-center group-hover:bg-samsic-sable transition-colors">
                      <CalendarDays size={18} className="text-samsic-marine" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-samsic-marine font-body">Planning semaine</p>
                      <p className="text-xs text-samsic-marine-50 font-body">28 Mar → 3 Avr 2026</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-samsic-marine-50 group-hover:text-samsic-marine" />
                  </Link>

                  <Link
                    href="/alerts"
                    className="flex items-center gap-3 px-4 py-3 border border-samsic-sable-50 hover:border-[#C62828] hover:bg-white transition-colors group"
                  >
                    <div className="w-9 h-9 bg-samsic-sable-30 flex items-center justify-center group-hover:bg-[#C62828] group-hover:text-white transition-colors">
                      <BellRing size={18} className="text-[#C62828] group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#C62828] font-body">Traiter les alertes</p>
                      <p className="text-xs text-samsic-marine-50 font-body opacity-80">
                        {alerts.length} alertes — {criticalCount} critique{criticalCount > 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-samsic-marine-50 group-hover:text-[#C62828]" />
                  </Link>

                  <Link
                    href="/employees"
                    className="flex items-center gap-3 px-4 py-3 border border-samsic-sable-50 hover:border-samsic-marine hover:bg-samsic-sable-30 transition-colors group"
                  >
                    <div className="w-9 h-9 bg-samsic-sable-30 flex items-center justify-center group-hover:bg-samsic-sable transition-colors">
                      <Users size={18} className="text-samsic-marine" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-samsic-marine font-body">Effectifs & Backups</p>
                      <p className="text-xs text-samsic-marine-50 font-body">22 agents — 5 backups dispo</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto text-samsic-marine-50 group-hover:text-samsic-marine" />
                  </Link>

                  {/* Indicateur postes non couverts */}
                  {kpi.uncoveredPosts > 0 && (
                    <div className="px-3 py-2 bg-white border border-[#C62828] flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#C62828] animate-pulse flex-shrink-0" />
                      <span className="text-xs text-[#C62828] font-bold font-body">
                        {kpi.uncoveredPosts} poste{kpi.uncoveredPosts > 1 ? 's' : ''} non couvert{kpi.uncoveredPosts > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

