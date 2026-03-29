'use client';

/**
 * HeroMetrics — Composant spécification CEO
 * 5 cartes inline avec metrics clés, polices massives, trait latéral 4px, sparklines intégrées.
 */

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// Fonction pseudo-aléatoire déterministe au lieu de Math.random() pour éviter le crash d'hydratation
const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// Données fictives pour les sparklines de 30 jours (tendance)
const generateSparklineData = (trend: 'up' | 'down' | 'stable', seedStart: number, volatility = 10) => {
  let base = 50;
  return Array.from({ length: 30 }, (_, i) => {
    const random = pseudoRandom(seedStart + i);
    if (trend === 'up') base += random * volatility - (volatility / 3);
    if (trend === 'down') base -= random * volatility - (volatility / 3);
    if (trend === 'stable') base += random * volatility - (volatility / 2);
    return { value: Math.max(0, base) };
  });
};

interface MetricCardProps {
  label: string;
  value: string | React.ReactNode;
  trendValue: string;
  trendDir: 'up' | 'down' | 'neutral';
  isPrimary?: boolean;
  sparklineData: { value: number }[];
  delay?: string;
}

function MetricCard({ label, value, trendValue, trendDir, isPrimary, sparklineData, delay = '0s' }: MetricCardProps) {
  const isPositive = trendDir === 'up';
  const isNegative = trendDir === 'down';

  const TrendIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;
  const trendColor = isPositive ? 'text-[#2E7D32]' : isNegative ? 'text-[#C62828]' : 'text-samsic-marine-50';

  return (
    <div 
      className={`relative overflow-hidden p-5 flex flex-col justify-between border ring-1 ring-inset ${
        isPrimary 
          ? 'bg-samsic-marine text-white border-samsic-marine ring-white/10 shadow-lg' 
          : 'bg-white text-samsic-marine border-samsic-sable-50 ring-transparent shadow-sm'
      }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex justify-between items-start mb-4 relative z-10 w-full">
        <h3 className={`font-body font-bold text-xs uppercase tracking-widest ${isPrimary ? 'text-samsic-sable' : 'text-samsic-marine-50'}`}>
          {label}
        </h3>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 ${isPrimary ? 'bg-white/10 text-white' : trendColor + ' bg-[#f8f9fa] border border-samsic-sable-50'}`}>
          <TrendIcon size={14} strokeWidth={2.5} />
          {trendValue}
        </div>
      </div>
      
      <div className="relative z-10">
        <span className="font-display font-black text-4xl leading-none tracking-tight">
          {value}
        </span>
      </div>

      {/* Sparkline en absolute au fond de la carte */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPrimary ? '#E7DFCE' : '#1797D8'} 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export interface HeroMetricsProps {
  coverageRate: number;
  savings: number;
  aiValidationsCount: number;
  totalValidationsCount: number;
}

export function HeroMetrics({ coverageRate, savings, aiValidationsCount, totalValidationsCount }: HeroMetricsProps) {
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || 'semaine';
  
  // Multiplicateur pour simuler le volume selon la période
  const multiplier = period === 'annee' ? 52 : period === 'trimestre' ? 12 : period === 'mois' ? 4 : 1;

  // Données fictives ajustées par période
  const metrics = [
    {
      label: "Tx couverture",
      value: `${coverageRate.toFixed(1)}%`,
      trendValue: coverageRate === 100 ? "+4pts" : "0pts",
      trendDir: (coverageRate === 100 ? "up" : "neutral") as "up" | "down" | "neutral",
      isPrimary: true,
      sparklineData: generateSparklineData(coverageRate === 100 ? 'up' : 'stable', 101, 5),
    },
    {
      label: "Économie (ROI)",
      value: `+${((savings || 487) * multiplier).toLocaleString('fr-FR')}€`,
      trendValue: "12%",
      trendDir: "up" as const,
      sparklineData: generateSparklineData('up', 202, 15),
    },
    {
      label: "Heures sauvées",
      value: `${65 * multiplier}h`,
      trendValue: `${4 * multiplier}h`,
      trendDir: "up" as const,
      sparklineData: generateSparklineData('up', 303, 8),
    },
    {
      label: "Délai alloc.",
      value: period === 'annee' ? "12s" : "8s",
      trendValue: "44m",
      trendDir: "down" as const, // Down is good for delay
      sparklineData: generateSparklineData('down', 404, 12),
    },
    {
      label: "Validations IA",
      value: `${(aiValidationsCount * multiplier).toFixed(0)}/${(totalValidationsCount * multiplier).toFixed(0)}`,
      trendValue: "75%",
      trendDir: "neutral" as const,
      sparklineData: generateSparklineData('stable', 505, 6),
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {metrics.map((m, i) => (
        <MetricCard 
          key={i}
          label={m.label}
          value={m.value}
          trendValue={m.trendValue}
          trendDir={m.trendDir}
          isPrimary={m.isPrimary}
          sparklineData={m.sparklineData}
          delay={`${i * 0.1}s`}
        />
      ))}
    </div>
  );
}

