/**
 * PlanningGrid — Grille matricielle clients × jours
 * @samsic-planning-grid Sections 1, 2, 4, 5, 6, 7, 9
 * @samsic-design-system — Couleurs, 0-radius
 * @react-patterns — Client Component, minimal state
 * @frontend-design — Sticky headers, scroll horizontal
 */
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Sparkles, Download, Calendar } from 'lucide-react';
import { PlanningCell } from './PlanningCell';
import { PrintButton } from '@/components/ui/PrintButton';
import {
  type CellData,
  type CellStatus,
  getDaysInRange,
  formatWeekRange,
  toDateString,
  CELL_STYLES,
} from './CellStyles';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// ==================== TYPES ====================

export interface ClientRow {
  id: string;
  name: string;
  industry: string | null;
  posts: PostRow[];
}

export interface PostRow {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

export interface AssignmentData {
  id: string;
  postId: string;
  date: string;
  status: CellStatus;
  employeeId: string;
  aiScore?: number | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeType: string;
  };
  post: {
    id: string;
    clientId: string;
  };
}

interface PlanningGridProps {
  startDate: Date;
  endDate: Date;
  clients: ClientRow[];
  assignments: AssignmentData[];
  onPeriodChange: (start: Date, end: Date) => void;
  onCellClick: (postId: string, clientId: string, clientName: string, postName: string, date: string) => void;
  onSimulationAccept?: (assignment: AssignmentData) => void;
  onReorgClick?: () => void;
  onAutoScheduleClick?: () => void;
}

// ==================== HELPERS ====================

const DAY_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

// ==================== SUB-COMPONENTS ====================

// @samsic-planning-grid Section 4
function SimulationBanner({ onExit }: { onExit: () => void }) {
  return (
    <div className="bg-simulation text-white text-center py-2 px-4 font-body font-bold text-sm flex items-center justify-center gap-3">
      <span className="animate-pulse">◉</span>
      MODE SIMULATION — Les modifications ne sont pas sauvegardées
      <button
        onClick={onExit}
        className="ml-4 bg-white text-simulation px-3 py-1 text-xs font-bold hover:bg-simulation-bg transition-colors"
      >
        Quitter la simulation
      </button>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function PlanningGrid({
  startDate,
  endDate,
  clients,
  assignments,
  onPeriodChange,
  onCellClick,
  onReorgClick,
  onAutoScheduleClick,
}: PlanningGridProps) {
  const [isSimulation, setIsSimulation] = useState(false);
  const [showWeekend, setShowWeekend] = useState(false);

  // Calcul des dates
  const visibleDays = useMemo(() => getDaysInRange(startDate, endDate), [startDate, endDate]);

  // Index des affectations par postId+date pour lookup O(1)
  const assignmentIndex = useMemo(() => {
    const idx: Record<string, AssignmentData> = {};
    for (const a of assignments) {
      idx[`${a.postId}|${a.date.split('T')[0]}`] = a;
    }
    return idx;
  }, [assignments]);

  // Fonction utilitaire pour déplacer la période d'un montant (ex: 7 jours)
  const shiftPeriod = useCallback((daysOffset: number) => {
    const diff = endDate.getTime() - startDate.getTime();
    const newStart = new Date(startDate);
    newStart.setUTCDate(newStart.getUTCDate() + daysOffset);
    const newEnd = new Date(newStart.getTime() + diff);
    onPeriodChange(newStart, newEnd);
  }, [startDate, endDate, onPeriodChange]);

  const goToPrevWeek = () => shiftPeriod(-7);
  const goToNextWeek = () => shiftPeriod(7);

  const goToToday = useCallback(() => {
    const today = new Date('2026-03-28T00:00:00.000Z'); // Date fixe démo
    const diff = endDate.getTime() - startDate.getTime();
    const monday = new Date(today);
    monday.setUTCDate(today.getUTCDate() - today.getUTCDay() + 1);
    const newEnd = new Date(monday.getTime() + diff);
    onPeriodChange(monday, newEnd);
  }, [startDate, endDate, onPeriodChange]);

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Planning');
    
    // Configurer les colonnes
    const columns = [
      { header: 'Client', key: 'client', width: 25 },
      { header: 'Poste', key: 'post', width: 30 },
      ...visibleDays.map(d => ({ header: `${DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()}/${d.getMonth() + 1}`, key: toDateString(d), width: 20 }))
    ];
    worksheet.columns = columns;

    // Ajouter le header avec styles
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF13294B' } };

    // Remplir les données
    clients.forEach(c => {
      c.posts.forEach(p => {
        const rowData: Record<string, string> = {
          client: c.name,
          post: p.name + ` (${p.startTime} - ${p.endTime})`
        };
        
        visibleDays.forEach(d => {
          const dateStr = toDateString(d);
          const cellData = getCellData(p.id, c.id, c.name, p.name, p.startTime, p.endTime, d);
          rowData[dateStr] = cellData ? `${cellData.employeeName} (${cellData.status})` : 'NON COUVERT';
        });

        const row = worksheet.addRow(rowData);
        
        // Colorer les cellules selon le statut
        visibleDays.forEach((d, i) => {
          const cellData = getCellData(p.id, c.id, c.name, p.name, p.startTime, p.endTime, d);
          const excelCell = row.getCell(i + 3);
          if (!cellData) {
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDED4C9' } };
            excelCell.font = { color: { argb: 'FF13294B' } };
          } else {
            const style = CELL_STYLES[cellData.status];
            // Format HTML hex to ARGB
            const argb = 'FF' + style.bg.replace('#', '').toUpperCase();
            excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
          }
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Planning_Samsic_${toDateString(startDate)}.xlsx`);
  };

  // Build CellData depuis l'index d'affectations
  function getCellData(postId: string, clientId: string, clientName: string, postName: string, startTime: string, endTime: string, date: Date): CellData | null {
    const key = `${postId}|${toDateString(date)}`;
    const a = assignmentIndex[key];
    if (!a) return null;

    return {
      postId,
      clientId,
      clientName,
      postName,
      employeeId: a.employeeId,
      employeeInitials: getInitials(a.employee.firstName, a.employee.lastName),
      employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
      employeePhoto: `https://ui-avatars.com/api/?name=${a.employee.firstName}+${a.employee.lastName}&background=F4F5F7&color=13294B&rounded=true&bold=true`,
      status: a.status,
      isSimulation: isSimulation,
      aiScore: a.aiScore,
      timeSlot: `${startTime} - ${endTime}`,
    };
  }

  // Compter les cellules non couvertes pour le header
  const uncoveredCount = useMemo(() => {
    let count = 0;
    for (const client of clients) {
      for (const post of client.posts) {
        for (const date of visibleDays) {
          const key = `${post.id}|${toDateString(date)}`;
          if (!assignmentIndex[key]) count++;
        }
      }
    }
    return count;
  }, [clients, assignmentIndex, visibleDays]);

  return (
    <div className="flex flex-col h-full print:h-auto">
      {/* Simulation Banner */}
      {isSimulation && <SimulationBanner onExit={() => setIsSimulation(false)} />}

      {/* Planning Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 rounded-t-2xl">
        <div className="flex items-center justify-between gap-4">
          {/* Title + week range */}
          <div>
            <h1 className="text-xl font-body font-extrabold text-samsic-marine">
              Planning Matriciel
            </h1>
            <p suppressHydrationWarning className="text-sm text-samsic-marine-50 font-body mt-0.5">
              Du {startDate.toLocaleDateString('fr-FR')} au {endDate.toLocaleDateString('fr-FR')}
              {uncoveredCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-bold bg-danger-bg text-danger">
                  {uncoveredCount} non couvert{uncoveredCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Week navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevWeek}
                className="w-8 h-8 flex items-center justify-center bg-samsic-sable-30 text-samsic-marine hover:bg-samsic-sable transition-colors"
                title="Semaine précédente"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToToday}
                className="px-3 h-8 flex items-center gap-1 bg-samsic-sable-30 text-samsic-marine text-xs font-bold font-body hover:bg-samsic-sable transition-colors"
                title="Aujourd'hui"
              >
                <Calendar size={12} />
                Aujourd'hui
              </button>
              <button
                onClick={goToNextWeek}
                className="w-8 h-8 flex items-center justify-center bg-samsic-sable-30 text-samsic-marine hover:bg-samsic-sable transition-colors"
                title="Semaine suivante"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Export Excel API */}
            <button
              onClick={handleExportExcel}
              className="px-3 h-8 flex items-center gap-2 bg-samsic-marine-50 text-white text-xs font-bold font-body shadow-sm hover:bg-samsic-marine transition-all ml-2"
              title="Exporter vers Excel"
            >
              <Download size={13} className="text-white" />
              Export
            </button>

            {/* AI Auto Schedule Button */}
            <button
              onClick={onAutoScheduleClick}
              className="px-3 h-8 flex items-center gap-2 bg-samsic-marine text-white text-xs font-bold font-body shadow-sm hover:bg-samsic-marine-80 hover:shadow-md transition-all ml-2"
              title="Générer un planning 100% IA"
            >
              <Sparkles size={13} className="text-samsic-sable" />
              Générer Planning IA
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* IA Réorganisation */}
            {onReorgClick && (
              <button
                onClick={onReorgClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-samsic-bleu text-white shadow-sm text-xs font-body font-bold hover:opacity-90 transition-opacity"
              >
                <Sparkles size={13} />
                Analyser IA
              </button>
            )}

            {/* Weekend toggle */}
            <button
              onClick={() => setShowWeekend(!showWeekend)}
              className="flex items-center gap-2 px-3 h-8 border border-samsic-sable-50 text-xs font-body font-semibold text-samsic-marine hover:bg-samsic-sable-30 transition-colors"
            >
              {showWeekend ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              Week-end
            </button>

            {/* Simulation mode toggle */}
            <button
              onClick={() => setIsSimulation(!isSimulation)}
              className={`flex items-center gap-2 px-3 h-8 text-xs font-body font-bold tracking-wide transition-colors ${
                isSimulation
                  ? 'bg-simulation text-white'
                  : 'border-2 border-simulation text-simulation hover:bg-simulation-bg'
              }`}
            >
              {isSimulation ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              Mode Simulation
            </button>
          </div>
        </div>
      </div>

      {/* Grid container */}
      <div className="flex-1 overflow-auto print:overflow-visible bg-[#F8F9FA] rounded-b-2xl">
        <table className="border-collapse w-full min-w-[700px] print:min-w-0">
          {/* Sticky Header row */}
          <thead className="sticky top-0 z-20">
            <tr>
              {/* Client/Post column header */}
              <th
                className="w-48 min-w-[140px] bg-[#F8F9FA] text-gray-500 text-left px-6 py-4 text-[10px] font-body font-bold uppercase tracking-wider border-b border-gray-100 sticky left-0 z-30 shadow-[1px_0_0_0_#f3f4f6]"
              >
                CLIENT / POSTE
              </th>
              {visibleDays.map((date, i) => {
                const isWeekend = i >= 5;
                const isToday = toDateString(date) === '2026-03-28';
                return (
                  <th
                    key={i}
                    className={`text-center px-4 py-4 min-w-[140px] border-b border-gray-100 ${
                       isToday ? 'bg-white' : 'bg-[#F8F9FA]'
                    } ${isWeekend ? 'opacity-60' : ''}`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-samsic-bleu' : 'text-gray-400'}`}>{DAY_LABELS[i]}</div>
                    <div suppressHydrationWarning className={`text-xl font-bold mt-1 ${isToday ? 'text-samsic-bleu' : 'text-samsic-marine'}`}>
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {clients.map((client) =>
              client.posts.map((post, postIdx) => {
                const isFirstPost = postIdx === 0;
                return (
                  <tr
                    key={`${client.id}-${post.id}`}
                    className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Sticky left column — Client + Post */}
                    <td
                      className="bg-[#F8F9FA] sticky left-0 z-10 px-6 py-4 min-w-[180px] w-56 shadow-[1px_0_0_0_#f3f4f6] group-hover:bg-gray-50/50"
                    >
                      {isFirstPost && (
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 rounded-md bg-samsic-sable-30 flex items-center justify-center text-[10px] font-bold text-samsic-marine">
                            {client.name.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-xs font-extrabold text-samsic-marine font-body tracking-wide truncate">
                            {client.name}
                          </p>
                        </div>
                      )}
                      
                      <div className="pl-9 flex flex-col gap-0.5">
                        <p className="text-xs font-semibold text-samsic-marine-80 font-body truncate">
                          {post.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium font-body flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          {post.startTime} – {post.endTime}
                        </p>
                      </div>
                    </td>

                    {/* Day cells */}
                    {visibleDays.map((date, dayIdx) => {
                      const isWeekend = dayIdx >= 5;
                      const dateStr = toDateString(date);
                      const isToday = dateStr === '2026-03-28';
                      const cellData = getCellData(post.id, client.id, client.name, post.name, post.startTime, post.endTime, date);

                      return (
                        <td
                          key={dayIdx}
                          className={`p-2 border-l border-gray-100 ${isToday ? 'bg-white' : 'bg-[#F8F9FA] group-hover:bg-gray-50/50'}`}
                        >
                          <PlanningCell
                            data={cellData}
                            isSimulation={isSimulation}
                            isWeekend={isWeekend}
                            onClick={() =>
                              onCellClick(post.id, client.id, client.name, post.name, dateStr)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div className="flex items-center justify-center h-48 text-samsic-marine-50 font-body text-sm">
            Aucun client actif trouvé
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="bg-white px-6 py-4 flex-shrink-0 shadow-[0_-1px_2px_0_rgb(0,0,0,0.02)] z-10">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-xs text-samsic-marine-50 font-body font-semibold uppercase tracking-wider">Légende :</span>
          {(['CONFIRMED', 'TRAINED_BACKUP', 'UNTRAINED_BACKUP', 'UNCOVERED'] as const).map(status => {
            const s = CELL_STYLES[status];
            return (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm"
                  style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                >
                  {s.icon}
                </span>
                <span className="text-xs text-samsic-marine-80 font-body">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
