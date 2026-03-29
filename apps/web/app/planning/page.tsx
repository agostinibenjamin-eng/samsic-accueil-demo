/**
 * /planning — Page Planning Matriciel
 * @samsic-planning-grid — Assemblage PlanningGrid + AISuggestionPanel + AIReorgPanel
 * @nextjs-best-practices — Client Component (interactif)
 * @samsic-design-system — Layout avec sidebar
 */
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { PlanningSidebar } from '@/components/layout/PlanningSidebar';
import { PlanningGrid, type ClientRow, type AssignmentData } from '@/components/planning/PlanningGrid';
import { AISuggestionPanel } from '@/components/ai/AISuggestionPanel';
import { AIReorgPanel } from '@/components/ai/AIReorgPanel';
import { AIAutoScheduleModal } from '@/components/ai/AIAutoScheduleModal';

interface SelectedCell {
  postId: string;
  clientId: string;
  clientName: string;
  postName: string;
  date: string;
}

export default function PlanningPage() {
  // Calcule dynamiquement le lundi de la semaine en cours
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // ajuster à lundi
    return new Date(d.getFullYear(), d.getMonth(), diff);
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 6; // dimanche
    return new Date(d.getFullYear(), d.getMonth(), diff);
  });
  
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [absences, setAbsences] = useState<{ id: string; employeeId: string; startDate: string; endDate: string; reason: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [clientId, setClientId] = useState('ALL');
  const [employeeId, setEmployeeId] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [isReorgOpen, setIsReorgOpen] = useState(false);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);

  // Fetch données planning
  const fetchPlanningData = useCallback(async (start: Date, end: Date) => {
    setIsLoadingData(true);
    try {
      const startStr = start.toISOString().split('T')[0];
      const endStr = end.toISOString().split('T')[0];
      const [clientsRes, planningRes, empRes] = await Promise.all([
        fetch('/api/clients', { cache: 'no-store' }),
        fetch(`/api/planning?startDate=${startStr}&endDate=${endStr}&t=${Date.now()}`, { cache: 'no-store' }),
        fetch('/api/employees', { cache: 'no-store' }),
      ]);

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data);
      }
      if (planningRes.ok) {
        const data = await planningRes.json();
        setAssignments(data.assignments ?? []);
        setAbsences(data.absences ?? []);
      }
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Erreur chargement planning:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchPlanningData(startDate, endDate);
  }, [startDate, endDate, fetchPlanningData]);

  const handlePeriodChange = useCallback(
    (start: Date, end: Date) => {
      setStartDate(start);
      setEndDate(end);
    },
    []
  );

  const handleCellClick = useCallback(
    (postId: string, clientId: string, clientName: string, postName: string, date: string) => {
      setSelectedCell({ postId, clientId, clientName, postName, date });
    },
    []
  );

  const handlePanelClose = useCallback(() => {
    setSelectedCell(null);
  }, []);

  const handleAccept = useCallback(
    async (employeeId: string, _code: string, score: number) => {
      if (!selectedCell) return;
      try {
        await fetch('/api/planning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            postId: selectedCell.postId,
            date: selectedCell.date,
            status: 'CONFIRMED',
            aiSuggested: true,
            aiScore: score,
          }),
        });
      } catch (err) {
        console.error('Erreur affectation AI:', err);
      } finally {
        setSelectedCell(null);
        fetchPlanningData(startDate, endDate);
      }
    },
    [startDate, endDate, fetchPlanningData, selectedCell]
  );

  // Computed state pour le filtrage
  const filteredClients = clients.filter(c => {
    // 1. Filtre Client
    if (clientId !== 'ALL' && c.id !== clientId) return false;
    
    // 2. Filtre Catégorie / Industrie
    if (category !== 'ALL' && c.industry !== category) return false;

    // 3. Filtre de recherche texte
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.posts.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // 4. Filtre Employé
    if (employeeId !== 'ALL') {
      const hasEmployeeAssignment = c.posts.some(p => {
        return assignments.some(a => a.postId === p.id && a.employeeId === employeeId);
      });
      if (!hasEmployeeAssignment) return false;
    }

    return true;
  });

  const filteredAssignments = useMemo(() => {
    let list = employeeId !== 'ALL' 
      ? assignments.filter(a => a.employeeId === employeeId) 
      : assignments;

    return list.map(a => {
      const aDate = new Date(a.date).toISOString().split('T')[0];
      const isAbsent = absences.some(abs => {
        if (abs.employeeId !== a.employeeId) return false;
        const absStart = new Date(abs.startDate).toISOString().split('T')[0];
        const absEnd = new Date(abs.endDate).toISOString().split('T')[0];
        return aDate >= absStart && aDate <= absEnd;
      });

      if (isAbsent) {
        return { ...a, status: 'ABSENT' as any };
      }
      return a;
    });
  }, [assignments, employeeId, absences]);

  return (
    <div className="flex h-full w-full overflow-hidden print:overflow-visible print:bg-white">
      <PlanningSidebar
        startDate={startDate.toISOString().split('T')[0]}
        endDate={endDate.toISOString().split('T')[0]}
        onStartDateChange={(d) => setStartDate(new Date(d))}
        onEndDateChange={(d) => setEndDate(new Date(d))}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        clientId={clientId}
        onClientFilterChange={setClientId}
        employeeId={employeeId}
        onEmployeeFilterChange={setEmployeeId}
        category={category}
        onCategoryChange={setCategory}
        clientsList={clients.map(c => ({ id: c.id, name: c.name }))}
        employeesList={employees}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-page)] print:overflow-visible print:bg-white p-6 gap-4">
        {/* Loading overlay */}
        {isLoadingData && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-samsic-sable border-t-samsic-marine animate-spin" />
              <p className="text-sm font-body text-samsic-marine">Chargement du planning…</p>
            </div>
          </div>
        )}

        <PlanningGrid
          startDate={startDate}
          endDate={endDate}
          clients={filteredClients}
          assignments={filteredAssignments}
          onPeriodChange={handlePeriodChange}
          onCellClick={handleCellClick}
          onReorgClick={() => setIsReorgOpen(true)}
          onAutoScheduleClick={() => setIsAutoScheduleOpen(true)}
        />
      </main>

      {/* AI Reorg Panel — Suggestions réorganisation planning */}
      <AIReorgPanel
        isOpen={isReorgOpen}
        weekStart={startDate.toISOString().split('T')[0]}
        onClose={() => setIsReorgOpen(false)}
        onComplete={() => fetchPlanningData(startDate, endDate)}
      />

      {/* AI Suggestion Panel (Tâche 3 + 4) */}
      <AISuggestionPanel
        isOpen={!!selectedCell}
        postId={selectedCell?.postId ?? null}
        clientName={selectedCell?.clientName ?? ''}
        postName={selectedCell?.postName ?? ''}
        date={selectedCell?.date ?? null}
        onClose={handlePanelClose}
        onAccept={handleAccept}
      />

      <AIAutoScheduleModal
        isOpen={isAutoScheduleOpen}
        onClose={() => setIsAutoScheduleOpen(false)}
        onComplete={() => fetchPlanningData(startDate, endDate)}
        currentDate={startDate}
      />
    </div>
  );
}
