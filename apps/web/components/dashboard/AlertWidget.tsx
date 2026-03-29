/**
 * AlertWidget — Panneau alertes critiques sur le Dashboard
 * @samsic-design-system — Couleurs fonctionnelles CRITICAL/WARNING/INFO
 * @react-patterns — Props typées, pas de state interne
 */
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface AlertItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  date?: string | null;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertTriangle,
    border: 'border-l-[4px] border-[#C62828]',
    bg: 'bg-white',
    text: 'text-[#C62828]',
    badgeBg: 'bg-[#FFEBEE]',
    label: 'CRITIQUE',
  },
  WARNING: {
    icon: AlertCircle,
    border: 'border-l-[4px] border-samsic-sable',
    bg: 'bg-white',
    text: 'text-samsic-marine',
    badgeBg: 'bg-samsic-sable-30',
    label: 'ATTENTION',
  },
  INFO: {
    icon: Info,
    border: 'border-l-[4px] border-samsic-bleu',
    bg: 'bg-white',
    text: 'text-samsic-marine',
    badgeBg: 'bg-blue-50',
    label: 'INFO',
  },
};

interface AlertWidgetProps {
  alerts: AlertItem[];
}

export function AlertWidget({ alerts }: AlertWidgetProps) {
  return (
    <div className="bg-white border border-samsic-sable-50 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-samsic-sable-50">
        <h2 className="text-base font-body font-bold text-samsic-marine">
          Alertes actives
        </h2>
        {alerts.length > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold font-body bg-danger text-white">
            {alerts.length} NOUVELLES
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 divide-y divide-samsic-sable-50">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-samsic-marine-50 text-sm font-body">
            ✓ Aucune alerte active
          </div>
        ) : (
          alerts.slice(0, 3).map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const IconComponent = config.icon;
            return (
              <div key={alert.id} className={`flex items-start gap-4 p-5 ${config.bg} ${config.border} hover:bg-[#fafafa] transition-colors group`}>
                <div className={`p-2 shrink-0 ${config.badgeBg} ${alert.severity === 'CRITICAL' ? 'text-[#C62828]' : 'text-samsic-marine'}`}>
                  <IconComponent size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-body font-bold text-sm leading-tight text-samsic-marine`}>{alert.title}</p>
                    {alert.date && (
                      <span className="text-[10px] text-samsic-marine-50 uppercase tracking-wider font-bold shrink-0 ml-4">
                        {new Date(alert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-samsic-marine-80 font-body line-clamp-2 leading-relaxed">{alert.description}</p>
                  <Link href="/alerts" className="mt-3 inline-flex items-center gap-1 text-samsic-bleu font-body font-bold text-xs hover:text-samsic-marine transition-colors opacity-80 group-hover:opacity-100">
                    Traiter l&apos;alerte <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      {alerts.length > 0 && (
        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-samsic-sable-50 mt-auto">
          <Link
            href="/alerts"
            className="flex items-center justify-center gap-2 w-full bg-white border border-samsic-sable-50 px-4 py-2 text-xs font-bold text-samsic-marine hover:bg-samsic-marine hover:text-white transition-colors"
          >
            Toutes les alertes
          </Link>
        </div>
      )}
    </div>
  );
}

