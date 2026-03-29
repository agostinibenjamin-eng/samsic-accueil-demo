'use client';

/**
 * RoiWidget — Widget ROI hebdomadaire
 * CEO priority: démontrer la valeur business en chiffres concrets
 * "Ce système vous économise X€/semaine"
 */

import { TrendingDown, Clock, Euro, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { InfoTooltip } from '@/components/dashboard/InfoTooltip';

interface RoiData {
  manualHoursSaved: number;    // heures de recherche manuelle évitées
  positionsFilledByAI: number; // postes couverts automatiquement
  avgResponseSeconds: number;  // délai moyen suggestion IA
  costSavedEur: number;        // économie estimée en €
}

const DEMO_ROI: RoiData = {
  manualHoursSaved: 6.5,
  positionsFilledByAI: 9,
  avgResponseSeconds: 8,
  costSavedEur: 487,
};

// Compteur animé
function AnimatedNumber({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const step = target / 40;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setValue(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [target]);

  return <span>{prefix}{value}{suffix}</span>;
}

export function RoiWidget() {
  return (
    <div className="bg-samsic-marine">
      {/* Header */}
      <div className="px-6 py-4 border-b border-samsic-marine-80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-samsic-sable" />
          <h2 className="text-white font-bold font-body">Impact IA — Cette semaine</h2>
          <InfoTooltip 
            variant="dark" 
            content="Statistiques simulées mettant en valeur les économies métiers générées par l'automatisation IA." 
          />
        </div>
        <span className="text-samsic-sable-50 text-xs font-body">28 Mar → 3 Avr 2026</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-samsic-marine-80">
        {/* Économie € */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Euro size={12} className="text-samsic-sable" />
            <span className="text-samsic-sable-50 text-xs font-body uppercase tracking-wider">Économie estimée</span>
          </div>
          <div className="text-4xl font-black font-display text-samsic-sable leading-none mb-1">
            <AnimatedNumber target={DEMO_ROI.costSavedEur} prefix="+" suffix="€" />
          </div>
          <p className="text-samsic-marine-30 text-xs font-body">vs. gestion manuelle</p>
        </div>

        {/* Heures économisées */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-samsic-sable" />
            <span className="text-samsic-sable-50 text-xs font-body uppercase tracking-wider">Heures économisées</span>
          </div>
          <div className="text-4xl font-black font-display text-white leading-none mb-1">
            <AnimatedNumber target={DEMO_ROI.manualHoursSaved * 10} suffix="h" />{/* x10 pour animation */}
          </div>
          <p className="text-samsic-marine-30 text-xs font-body">d&apos;appels téléphoniques</p>
        </div>

        {/* Postes couverts par IA */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingDown size={12} className="text-samsic-sable" />
            <span className="text-samsic-sable-50 text-xs font-body uppercase tracking-wider">Postes gérés IA</span>
          </div>
          <div className="text-4xl font-black font-display text-white leading-none mb-1">
            <AnimatedNumber target={DEMO_ROI.positionsFilledByAI} />
            <span className="text-lg text-samsic-sable-50 font-body font-normal"> / 12</span>
          </div>
          <p className="text-samsic-marine-30 text-xs font-body">remplacements automatisés</p>
        </div>

        {/* Délai moyen */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-samsic-sable" />
            <span className="text-samsic-sable-50 text-xs font-body uppercase tracking-wider">Délai moyen</span>
          </div>
          <div className="text-4xl font-black font-display text-samsic-sable leading-none mb-1">
            <AnimatedNumber target={DEMO_ROI.avgResponseSeconds} suffix=" sec" />
          </div>
          <p className="text-samsic-marine-30 text-xs font-body">contre ~45 min avant</p>
        </div>
      </div>

      {/* Barre de progression ROI */}
      <div className="px-6 py-3 border-t border-samsic-marine-80 flex items-center gap-3">
        <span className="text-xs text-samsic-sable-50 font-body flex-shrink-0">Taux d&apos;automatisation</span>
        <div className="flex-1 bg-samsic-marine-80 h-1.5">
          <div className="h-1.5 bg-samsic-sable" style={{ width: '75%', transition: 'width 1s ease' }} />
        </div>
        <span className="text-samsic-sable font-bold text-sm font-body flex-shrink-0">75%</span>
        <span className="text-samsic-marine-30 text-xs font-body">des remplacements sans intervention humaine</span>
      </div>
    </div>
  );
}
