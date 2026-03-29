/**
 * KpiCard — Carte KPI Dashboard
 * @samsic-design-system Section 5 — Card KPI spec exacte
 * @react-patterns — Composant pur, pas de state
 */
import React from 'react';
import type { LucideIcon } from 'lucide-react';

type KpiVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: KpiVariant;
  trend?: { value: number; label: string };
}

const VARIANT_STYLES: Record<KpiVariant, { border: string; iconBg: string; iconColor: string }> = {
  default: {
    border: 'border-samsic-sable',
    iconBg: 'bg-samsic-sable-30',
    iconColor: 'text-samsic-marine',
  },
  success: {
    border: 'border-success',
    iconBg: 'bg-success-bg',
    iconColor: 'text-success',
  },
  warning: {
    border: 'border-warning',
    iconBg: 'bg-warning-bg',
    iconColor: 'text-warning',
  },
  danger: {
    border: 'border-danger',
    iconBg: 'bg-danger-bg',
    iconColor: 'text-danger',
  },
  info: {
    border: 'border-samsic-bleu',
    iconBg: 'bg-samsic-bleu-30',
    iconColor: 'text-samsic-bleu',
  },
};

export function KpiCard({ title, value, subtitle, icon: Icon, variant = 'default', trend }: KpiCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`bg-white p-5 border-l-4 ${styles.border} shadow-sm flex items-start justify-between gap-4`}
      style={{ animation: 'slideInUp 0.3s ease forwards' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-samsic-marine-50 uppercase text-xs font-semibold tracking-wider mb-1 font-body">
          {title}
        </p>
        <div className="text-4xl font-display font-black text-samsic-marine leading-none mb-1">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-samsic-marine-50 font-body mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold mt-2 ${
            trend.value >= 0 ? 'text-success' : 'text-danger'
          }`}>
            <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
            <span className="text-samsic-marine-50 font-normal">{trend.label}</span>
          </div>
        )}
      </div>
      <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center ${styles.iconBg}`}>
        <Icon size={20} className={styles.iconColor} />
      </div>
    </div>
  );
}
