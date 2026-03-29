/**
 * /alerts — Page Alertes & Turnover v2
 * Catégories : ABSENCE, COVERAGE, TURNOVER, FRAGILITY, CERTIFICATION, LEGAL
 * Actions contextuelles : traiter, planifier formation, voir fiche
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertsSidebar } from '@/components/layout/AlertsSidebar';
import {
  AlertTriangle, AlertCircle, Info, CheckCircle,
  CalendarDays, Cpu, Filter, UserX, Shield,
  BookOpen, Scale, BarChart3, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface AlertV2 {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  title: string;
  description: string;
  clientId: string | null;
  postId: string | null;
  employeeId: string | null;
  date: string | null;
  isResolved: boolean;
  createdAt: string;
  action?: { label: string; href: string };
  aiContext?: { engineVersion: string; candidatesFound: number; topScore: number };
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertTriangle,
    border: 'border-[#C62828]',
    bg: 'bg-[#fce4ec]',
    text: 'text-[#C62828]',
    badge: 'bg-[#C62828] text-white',
    label: 'CRITIQUE',
  },
  WARNING: {
    icon: AlertCircle,
    border: 'border-[#E87A1E]',
    bg: 'bg-[#fff3e0]',
    text: 'text-[#E87A1E]',
    badge: 'bg-[#E87A1E] text-white',
    label: 'ATTENTION',
  },
  INFO: {
    icon: Info,
    border: 'border-[#0078b0]',
    bg: 'bg-[#e3f2fd]',
    text: 'text-[#0078b0]',
    badge: 'bg-[#0078b0] text-white',
    label: 'INFO',
  },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  ABSENCE:       { label: 'Absence',       icon: UserX,        color: '#C62828' },
  COVERAGE:      { label: 'Couverture',    icon: Shield,       color: '#E87A1E' },
  TURNOVER:      { label: 'Turnover',      icon: CalendarDays, color: '#7B1FA2' },
  FRAGILITY:     { label: 'Fragilité',     icon: BarChart3,    color: '#0078b0' },
  CERTIFICATION: { label: 'Certification', icon: BookOpen,     color: '#2E7D32' },
  LEGAL:         { label: 'Légal',         icon: Scale,        color: '#C62828' },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = filter ? `/api/alerts?category=${filter}` : '/api/alerts';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Erreur alertes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = useCallback(async (id: string) => {
    setResolvingId(id);
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Erreur résolution:', err);
    } finally {
      setResolvingId(null);
    }
  }, []);

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  const categoryCounts = alerts.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AlertsSidebar 
        filter={filter}
        onFilterChange={setFilter}
        categoryCounts={categoryCounts}
        totalAlerts={alerts.length}
      />

      <main className="flex-1 overflow-y-auto print:overflow-visible bg-[var(--bg-page)] print:bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-body font-extrabold text-samsic-marine">
                Alertes & Turnover
              </h1>
              <p className="text-sm text-samsic-marine-50 font-body mt-1">
                {alerts.length} alerte{alerts.length > 1 ? 's' : ''} active{alerts.length > 1 ? 's' : ''}
                {criticalCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-bold bg-[#C62828] text-white">
                    {criticalCount} CRITIQUE{criticalCount > 1 ? 'S' : ''}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-bold bg-[#E87A1E] text-white">
                    {warningCount} ATTENTION
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5 bg-[#e8f5e9] text-[#2E7D32]">
                <Cpu size={12} />
                <span className="text-xs font-bold font-body">Moteur IA v2.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#d5d0c8] border-t-[#0A0A0A] animate-spin" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="bg-white border border-[#d5d0c8] p-12 text-center">
              <CheckCircle size={32} className="text-[#2E7D32] mx-auto mb-3" />
              <p className="text-[#0A0A0A] font-bold font-body text-base mb-1">Aucune alerte active</p>
              <p className="text-[#6b6860] font-body text-sm">
                {filter ? `Aucune alerte de catégorie "${CATEGORY_CONFIG[filter]?.label}"` : 'Tous les postes sont couverts et le turnover est maîtrisé'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity];
                const catConfig = CATEGORY_CONFIG[alert.category];
                const IconComponent = config.icon;
                const CatIcon = catConfig?.icon;

                return (
                  <div
                    key={alert.id}
                    className={`bg-white border border-[#d5d0c8] border-l-4 ${config.border} flex items-start gap-4 px-5 py-4 hover:shadow-sm transition-shadow`}
                  >
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${config.bg}`}>
                      <IconComponent size={20} className={config.text} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 ${config.badge}`}>
                          {config.label}
                        </span>
                        {catConfig && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 flex items-center gap-1"
                            style={{ backgroundColor: catConfig.color + '15', color: catConfig.color }}
                          >
                            {CatIcon && <CatIcon size={10} />}
                            {catConfig.label}
                          </span>
                        )}
                        {alert.date && (
                          <span className="text-xs text-[#6b6860] font-body flex items-center gap-1">
                            <CalendarDays size={11} />
                            {new Date(alert.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                              weekday: 'short', day: 'numeric', month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#0A0A0A] font-body mb-1">{alert.title}</p>
                      <p className="text-xs text-[#6b6860] font-body">{alert.description}</p>

                      {/* AI Context badge */}
                      {alert.aiContext && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold font-body px-2 py-0.5 bg-[#e3f2fd] text-[#0078b0] flex items-center gap-1">
                            <Cpu size={9} />
                            IA {alert.aiContext.engineVersion}
                          </span>
                          <span className="text-[10px] font-body text-[#6b6860]">
                            {alert.aiContext.candidatesFound} candidat{alert.aiContext.candidatesFound > 1 ? 's' : ''} · Score max: {alert.aiContext.topScore}/100
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {alert.action && (
                        <Link
                          href={alert.action.href}
                          className="px-3 py-2 bg-[#0A0A0A] text-white text-xs font-bold font-body hover:bg-[#333] transition-colors flex items-center gap-1"
                        >
                          {alert.action.label}
                          <ArrowRight size={11} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolvingId === alert.id}
                        className="px-3 py-2 border border-[#d5d0c8] text-xs font-bold text-[#a09e97] font-body hover:bg-[#F5F3EF] transition-colors disabled:opacity-50"
                      >
                        {resolvingId === alert.id ? '...' : 'Ignorer'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
