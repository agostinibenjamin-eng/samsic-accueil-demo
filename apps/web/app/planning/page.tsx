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

const toLocalISOString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const [showIssuesOnly, setShowIssuesOnly] = useState(false);
  
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [isReorgOpen, setIsReorgOpen] = useState(false);
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);

  const [pendingAssignments, setPendingAssignments] = useState<Record<string, AssignmentData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch données planning
  const fetchPlanningData = useCallback(async (start: Date, end: Date) => {
    setIsLoadingData(true);
    try {
      const startStr = toLocalISOString(start);
      const endStr = toLocalISOString(end);
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
    // On efface les pending quand on change de semaine
    setPendingAssignments({});
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
    (employeeId: string, _code: string, score: number) => {
      if (!selectedCell) return;
      
      const emp = employees.find(e => e.id === employeeId);
      if (!emp) return;

      const dateStr = selectedCell.date; // already YYYY-MM-DD
      const newAssignment: AssignmentData = {
        id: `pending-${Date.now()}`,
        postId: selectedCell.postId,
        date: dateStr + 'T00:00:00.000Z',
        status: 'CONFIRMED',
        employeeId,
        aiScore: score,
        employee: {
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          employeeType: 'TITULAR',
        },
        post: {
          id: selectedCell.postId,
          clientId: selectedCell.clientId,
        }
      };

      setPendingAssignments(prev => {
        const key = `${selectedCell.postId}|${dateStr}`;
        return { ...prev, [key]: newAssignment };
      });
      setSelectedCell(null);
    },
    [selectedCell, employees]
  );

  const handleSavePlanning = async () => {
    const pendingList = Object.values(pendingAssignments);
    if (pendingList.length === 0) return;
    
    setIsSaving(true);
    try {
      await fetch('/api/planning/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: pendingList }),
      });
      setPendingAssignments({});
      await fetchPlanningData(startDate, endDate);
    } catch (err) {
      console.error('Erreur sauvegarde globale:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const mergedAssignments = useMemo(() => {
     let list = [...assignments];
     const pendingKeys = Object.keys(pendingAssignments);
     
     if (pendingKeys.length > 0) {
        // Enlève ceux qui ont été écrasés
        list = list.filter(a => {
            const key = `${a.postId}|${a.date.split('T')[0]}`;
            return !pendingAssignments[key];
        });
        // Ajoute les nouveaux
        list.push(...Object.values(pendingAssignments));
     }
     
     return list;
  }, [assignments, pendingAssignments]);

  const filteredAssignments = useMemo(() => {
    let list = employeeId !== 'ALL' 
      ? mergedAssignments.filter(a => a.employeeId === employeeId) 
      : mergedAssignments;

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

  // Computed state pour le filtrage
  const filteredClients = useMemo(() => {
    // Calcul de visibleDays localement pour tester les couvertures
    const days: string[] = [];
    const curr = new Date(startDate);
    curr.setHours(0,0,0,0);
    const last = new Date(endDate);
    last.setHours(0,0,0,0);
    while (curr <= last) {
      if (curr.getDay() !== 0) { // Pas les dimanches
        days.push(curr.toISOString().split('T')[0]);
      }
      curr.setDate(curr.getDate() + 1);
    }

    return clients.map(c => {
      // Filtrer les postes de ce client
      const filteredPosts = c.posts.filter(p => {
        if (showIssuesOnly) {
           let hasIssue = false;
           for (const dateStr of days) {
              const a = filteredAssignments.find(asg => asg.postId === p.id && asg.date.startsWith(dateStr));
              if (!a || a.status === 'ABSENT' || a.status === 'UNCOVERED') {
                 hasIssue = true;
                 break;
              }
           }
           if (!hasIssue) return false;
        }

        // Si on cherche un employé, il faut qu'il soit sur ce poste
        if (employeeId !== 'ALL') {
           const hasEmployee = assignments.some(a => a.postId === p.id && a.employeeId === employeeId);
           if (!hasEmployee) return false;
        }

        // Filtre de recherche texte
        if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        return true;
      });

      return { ...c, posts: filteredPosts };
    }).filter(c => {
      if (c.posts.length === 0) return false;
      if (clientId !== 'ALL' && c.id !== clientId) return false;
      if (category !== 'ALL' && c.industry !== category) return false;
      return true;
    });
  }, [clients, clientId, category, searchQuery, employeeId, showIssuesOnly, filteredAssignments, assignments, startDate, endDate]);

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
        showIssuesOnly={showIssuesOnly}
        onShowIssuesOnlyChange={setShowIssuesOnly}
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
          pendingCount={Object.keys(pendingAssignments).length}
          onSave={handleSavePlanning}
          isSaving={isSaving}
        />
      </main>

      {/* AI Reorg Panel — Suggestions réorganisation planning */}
      <AIReorgPanel
        isOpen={isReorgOpen}
        weekStart={toLocalISOString(startDate)}
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
