'use client';

/**
 * CoverageChart (G1)
 * Area Chart: Courbe #24303b 2px monotone, remplissage #24303b 6%
 * Seuil 97% dashed #C62828 1px, tooltip fond #24303b blanc
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { InfoTooltip } from '@/components/dashboard/InfoTooltip';
import { Maximize, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { DashboardModal } from '@/components/ui/DashboardModal';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface DayData {
  day: string;
  totalPosts: number;
  coveredPosts: number;
  coverageRate: number;
  isToday: boolean;
  dateKey?: string;
}

export function CoverageChart({ data }: { data: DayData[] }) {
  // Tooltip personnalisé fond #24303b texte blanc
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DayData;
      return (
        <div className="bg-[#24303b] p-3 shadow-lg border-l-4 border-samsic-sable text-white font-body">
          <p className="font-bold mb-2 uppercase text-[11px] tracking-wider text-samsic-sable">{label}</p>
          <div className="flex flex-col gap-1 text-[13px]">
            <p className="flex justify-between w-40">
              <span className="text-samsic-marine-50">Taux couvert:</span>
              <span className="font-bold text-white">{data.coverageRate}%</span>
            </p>
            <p className="flex justify-between w-40">
              <span className="text-samsic-marine-50">Postes:</span>
              <span className="font-bold text-white">{data.coveredPosts} / {data.totalPosts}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isMaximized, setIsMaximized] = useState(false);

  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      // Simulate click to filter by deep date
      const dataPoint = e.activePayload[0].payload as DayData;
      // In real app, we'd use dataPoint.dateKey (YYYY-MM-DD)
      const mockDate = `2026-03-${dataPoint.day.split(' ')[1] || '28'}`;
      
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('date', mockDate);
      router.push(`${pathname}?${newParams.toString()}`);
    }
  };

  const ChartContent = ({ height = 260, isExpanded = false }: { height?: number, isExpanded?: boolean }) => (
    <div className={`p-5 flex-1 w-full relative ${isExpanded ? 'bg-white border-[#ded4c9] shadow-sm' : ''}`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }} onClick={handleChartClick} style={{ cursor: 'pointer' }}>
          <defs>
            <linearGradient id="colorCoverage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#24303b" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#24303b" stopOpacity={0.02}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ede5de" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#999ea3', fontFamily: 'Open Sans' }} 
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#999ea3', fontFamily: 'Open Sans' }}
            domain={[80, 100]} 
            ticks={[80, 85, 90, 95, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: '#ede5de', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          <ReferenceArea y1={80} y2={93} fill="#FFEBEE" fillOpacity={0.3} />
          <ReferenceLine y={97} stroke="#C62828" strokeDasharray="4 4" strokeWidth={1} />
          
          <Area 
            type="monotone" 
            dataKey="coverageRate" 
            stroke="#24303b" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCoverage)" 
            activeDot={{ r: 6, fill: '#24303b', stroke: 'white', strokeWidth: 2 }}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
      {isExpanded && (
        <div className="mt-8 bg-[#ede5de] p-5">
           <h3 className="font-bold font-body text-samsic-marine mb-3 uppercase tracking-wider text-xs">Données Brutes de la Période</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
             {data.map((d, i) => (
                <div key={i} className="bg-white p-3 border-l-4 border-[#24303b] shadow-sm">
                   <p className="text-[10px] text-samsic-marine-80 font-bold uppercase">{d.day}</p>
                   <p className="text-lg font-black text-samsic-marine leading-none mb-1">{d.coverageRate}%</p>
                   <p className="text-[10px] text-samsic-marine-50">{d.coveredPosts}/{d.totalPosts} obj.</p>
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-white shadow-sm border border-samsic-sable-50 flex flex-col h-full group relative">
        {/* En-tête du Widget */}
        <div className="px-6 py-5 border-b border-samsic-sable-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-body font-bold text-samsic-marine uppercase tracking-wider">
              Taux de couverture — Global
            </h2>
            <InfoTooltip content="Calculé dynamiquement selon affectations / postes actifs. Cliquez sur un jour pour zoomer sur sa date !" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 items-center text-xs mr-4">
              <span className="flex items-center gap-1 text-samsic-marine-50"><div className="w-2 h-2 rounded-full bg-[#24303b]"></div> Actuel</span>
              <span className="flex items-center gap-1 text-samsic-marine-50"><div className="w-4 border-t border-dashed border-[#C62828]"></div> Objectif (97%)</span>
            </div>
            
            {/* Bouton Agrandir */}
            <button 
              onClick={() => setIsMaximized(true)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-samsic-marine-50 hover:bg-samsic-sable-30 hover:text-samsic-marine transition-all focus:opacity-100"
              title="Agrandir en plein écran"
            >
              <Maximize size={16} strokeWidth={2.5}/>
            </button>
          </div>
        </div>

        {/* Corps du Widget (petit) */}
        <ChartContent height={260} />
      </div>

      {/* Modale d'Agrandissement (Grand format) */}
      <DashboardModal 
        isOpen={isMaximized} 
        onClose={() => setIsMaximized(false)} 
        title="Analyse Détaillée : Taux de couverture global"
      >
         <div className="flex items-center gap-4 mb-2 bg-white px-6 py-4 border-l-4 border-gray-100 shadow-sm shadow-sm">
            <p className="text-sm font-body text-samsic-marine">
               Le graphique ci-dessous représente l'évolution du ratio Postes Couverts / Postes Actifs sur la <strong>période sélectionnée</strong>. 
               L'objectif critique est maintenu à <strong className="text-[#C62828] font-black">97%</strong> par SAMSIC.
               Cliquez sur un nœud pour afficher le tableau de pilotage de ce jour spécifique.
            </p>
         </div>

         <ChartContent height={400} isExpanded={true} />
         
      </DashboardModal>
    </>
  );
}

