/**
 * PlanningCell — Cellule individuelle de la grille de planning
 * @samsic-planning-grid Sections 3, 5 — Interaction cellule → panneau IA
 * @samsic-design-system Section 6 — Codes couleur officiels
 * @react-patterns — React.memo pour optimiser le rendu
 */
'use client';

import React from 'react';
import { CELL_STYLES, type CellData } from './CellStyles';

interface PlanningCellProps {
  data: CellData | null;
  isSimulation: boolean;
  onClick: () => void;
  isWeekend?: boolean;
}

export const PlanningCell = React.memo(function PlanningCell({
  data,
  isSimulation,
  onClick,
  isWeekend = false,
}: PlanningCellProps) {
  // Cellule fermée (weekend sans activité)
  if (isWeekend && !data) {
    return (
      <div className="min-h-[4.5rem] h-full w-full flex items-center justify-center p-1">
        <div className="w-full h-full rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100/50 shadow-sm">
          <span className="text-base opacity-30 text-gray-300">—</span>
        </div>
      </div>
    );
  }

  // Cellule vide (non couverte) — clic pour déclencher l'IA
  if (!data) {
    return (
      <div className="h-full w-full p-1.5 min-h-[5rem]">
        <button
          onClick={onClick}
          className="w-full h-full flex flex-col items-center justify-center rounded-xl transition-all hover:scale-[0.98] group bg-white border border-dashed border-gray-200 hover:border-gray-300 shadow-sm"
          title="Non couvert — Cliquer pour suggestion IA"
        >
          <div className="flex items-center gap-1.5 font-bold font-body text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
            <span className="text-sm leading-none">+</span>
            <span className="leading-tight">Assigner</span>
          </div>
        </button>
      </div>
    );
  }

  // Mode simulation — overlay violet
  const effectiveStatus = isSimulation && data.status !== 'UNCOVERED' && data.isSimulation
    ? 'SIMULATION'
    : data.status;

  const s = CELL_STYLES[effectiveStatus];
  const showWarning = effectiveStatus === 'UNTRAINED_BACKUP';
  const isAbsent = effectiveStatus === 'ABSENT';

  return (
    <div className="h-full w-full p-1.5 min-h-[5.5rem] print:break-inside-avoid">
      <button
        onClick={onClick}
        className={`w-full h-full flex flex-col gap-1.5 p-3 rounded-xl transition-all hover:scale-[0.98] text-left shadow-sm border ${isAbsent ? 'ring-2 ring-red-400/50' : ''}`}
        style={{ 
          backgroundColor: 'white', 
          borderColor: isAbsent ? '#fca5a5' : s.border,
          backgroundImage: isAbsent ? 'repeating-linear-gradient(45deg, #fff5f5, #fff5f5 10px, #fee2e2 10px, #fee2e2 20px)' : 'none'
        }}
        title={`${data.employeeName ?? 'Non affecté'} — ${s.label}`}
      >
        <div className="flex items-center justify-between w-full h-8">
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar or Initials */}
            {data.employeePhoto ? (
              <img src={data.employeePhoto} alt={data.employeeName || ''} className="w-7 h-7 rounded-md object-cover flex-shrink-0 border" style={{ borderColor: s.border }} />
            ) : (
              <div 
                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
              >
                {data.employeeInitials || s.icon}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold font-body leading-tight truncate text-samsic-marine">
                {data.employeeName}
              </span>
            </div>
          </div>
          
          {showWarning && data.aiScore != null && (
            <span className="text-[10px] font-bold font-body px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200 shrink-0">
              {Math.round(data.aiScore)}
            </span>
          )}
        </div>

        {/* Status indicator & Time */}
        <div className="flex items-center justify-between w-full mt-1">
          <span className="text-xs text-samsic-marine font-semibold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{data.timeSlot}</span>
          <span 
            className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold border ml-auto"
            style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border + '40' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: s.border}}></span>
            {s.label}
          </span>
          {effectiveStatus === 'SIMULATION' && (
            <span className="uppercase tracking-widest font-bold text-simulation animate-pulse ml-2 text-[9px]">Sim</span>
          )}
        </div>
      </button>
    </div>
  );
});
