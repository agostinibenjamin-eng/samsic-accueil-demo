/**
 * AIInsightsWidget — Widget dashboard affichant les insights du moteur IA v2
 * Montre : Taux d'occupation global, CDD tracker, Formations recommandées, Score moyen
 */
'use client';

import { useMemo } from 'react';
import {
  Cpu, TrendingUp, Users, BookOpen,
  AlertTriangle, Clock, Zap
} from 'lucide-react';
import { useSamsicStore } from '@/lib/store/use-samsic-store';

function MiniKPI({ label, value, unit, color, icon: Icon }: {
  label: string; value: string | number; unit?: string; color: string; icon: typeof Cpu;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F3EF] border border-[#d5d0c8]">
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black font-display" style={{ color }}>{value}</span>
          {unit && <span className="text-[10px] text-[#6b6860] font-body">{unit}</span>}
        </div>
        <div className="text-[10px] text-[#6b6860] font-body leading-tight">{label}</div>
      </div>
    </div>
  );
}

export function AIInsightsWidget() {
  const { employees } = useSamsicStore();

  const insights = useMemo(() => {
    const active = employees.filter(e => e.isActive);
    const totalContract = active.reduce((s, e) => s + e.weeklyContractHours, 0);
    const totalAssigned = active.reduce((s, e) => s + e.weeklyAssignedHours, 0);
    const occupancyRate = totalContract > 0 ? Math.min(100, Math.round((totalAssigned / totalContract) * 100)) : 0;
    const idleHours = totalContract - totalAssigned;
    const idleCost = Math.round(idleHours * 16); // coût moyen estimé

    const cddEmployees = active.filter(e => e.contractType === 'CDD' && e.contractEndDate);
    const cddExpiring = cddEmployees.filter(e => {
      if (!e.contractEndDate) return false;
      const daysLeft = Math.ceil((new Date(e.contractEndDate).getTime() - Date.now()) / 86400000);
      return daysLeft > 0 && daysLeft <= 90;
    });

    const avgReliability = Math.round(active.reduce((s, e) => s + e.reliabilityScore, 0) / active.length);
    const lowOccupancy = active.filter(e => e.occupancyRate < 60);

    // Formations recommandées = agents avec des postes IN_PROGRESS
    const trainingInProgress = active.filter(e =>
      e.trainedPosts.some(t => t.status === 'IN_PROGRESS')
    );

    return {
      occupancyRate,
      idleHours,
      idleCost,
      agentCount: active.length,
      cddCount: cddEmployees.length,
      cddExpiring: cddExpiring.length,
      avgReliability,
      lowOccupancy: lowOccupancy.length,
      trainingInProgress: trainingInProgress.length,
    };
  }, [employees]);

  return (
    <div className="bg-white border border-[#d5d0c8] shadow-sm">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#d5d0c8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-[#0A0A0A]" />
          <h2 className="text-sm font-body font-bold text-[#0A0A0A]">Insights IA v2.0</h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e8f5e9] text-[#2E7D32]">TEMPS RÉEL</span>
      </div>

      <div className="p-4 space-y-3">
        {/* KPIs Grid */}
        <div className="grid grid-cols-2 gap-2">
          <MiniKPI
            label="Taux d'occupation"
            value={insights.occupancyRate}
            unit="%"
            color={insights.occupancyRate >= 85 ? '#2E7D32' : insights.occupancyRate >= 70 ? '#E87A1E' : '#C62828'}
            icon={TrendingUp}
          />
          <MiniKPI
            label="Heures non prestées"
            value={insights.idleHours}
            unit={`h/sem (${insights.idleCost}€)`}
            color={insights.idleHours <= 20 ? '#2E7D32' : '#E87A1E'}
            icon={Clock}
          />
          <MiniKPI
            label="Fiabilité moyenne"
            value={insights.avgReliability}
            unit="%"
            color={insights.avgReliability >= 90 ? '#2E7D32' : '#E87A1E'}
            icon={Zap}
          />
          <MiniKPI
            label="Agents actifs"
            value={insights.agentCount}
            unit={`dont ${insights.cddCount} CDD`}
            color="#0078b0"
            icon={Users}
          />
        </div>

        {/* Turnover & Training alerts */}
        <div className="space-y-1.5">
          {insights.cddExpiring > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#fff3e0] border-l-2 border-l-[#E87A1E]">
              <AlertTriangle size={12} className="text-[#E87A1E] flex-shrink-0" />
              <span className="text-xs font-body text-[#0A0A0A]">
                <strong className="text-[#E87A1E]">{insights.cddExpiring} CDD</strong> expir{insights.cddExpiring > 1 ? 'ent' : 'e'} dans les 90 jours
              </span>
            </div>
          )}
          {insights.lowOccupancy > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#e3f2fd] border-l-2 border-l-[#0078b0]">
              <Clock size={12} className="text-[#0078b0] flex-shrink-0" />
              <span className="text-xs font-body text-[#0A0A0A]">
                <strong className="text-[#0078b0]">{insights.lowOccupancy} agent{insights.lowOccupancy > 1 ? 's' : ''}</strong> sous-utilisé{insights.lowOccupancy > 1 ? 's' : ''} (occupation &lt; 60%)
              </span>
            </div>
          )}
          {insights.trainingInProgress > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#e8f5e9] border-l-2 border-l-[#2E7D32]">
              <BookOpen size={12} className="text-[#2E7D32] flex-shrink-0" />
              <span className="text-xs font-body text-[#0A0A0A]">
                <strong className="text-[#2E7D32]">{insights.trainingInProgress} formation{insights.trainingInProgress > 1 ? 's' : ''}</strong> en cours
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
