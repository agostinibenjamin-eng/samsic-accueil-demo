'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get('period') || 'semaine';

  const periods = [
    { value: 'semaine', label: 'Semaine' },
    { value: 'mois', label: 'Mois' },
    { value: 'trimestre', label: 'Trimestre' },
    { value: 'annee', label: 'Année' },
  ];

  const handlePeriodChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('period', val);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex bg-white border border-[#ded4c9] p-0.5 shadow-sm">
      {periods.map((p) => {
        const isActive = p.value === currentPeriod;
        return (
          <button
            key={p.value}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors font-body ${
              isActive 
                ? 'bg-[#24303b] text-white' 
                : 'text-[#5c666e] hover:bg-[#ede5de] hover:text-[#24303b]'
            }`}
             onClick={() => handlePeriodChange(p.value)}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
