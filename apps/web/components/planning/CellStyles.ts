/**
 * CellStyles — Codes couleur officiels SAMSIC Planning
 * @samsic-planning-grid Section 3 — Source unique de vérité pour les couleurs
 * @samsic-design-system Section 6
 */

export type CellStatus = 'CONFIRMED' | 'TRAINED_BACKUP' | 'UNTRAINED_BACKUP' | 'UNCOVERED' | 'CLOSED' | 'SIMULATION' | 'ABSENT';

export interface CellData {
  postId: string;
  clientId: string;
  clientName: string;
  postName: string;
  employeeId: string | null;
  employeeInitials: string | null;
  employeeName: string | null;
  employeePhoto?: string | null;
  status: CellStatus;
  isSimulation?: boolean;
  aiScore?: number | null;
  timeSlot?: string;
  isAbsent?: boolean;
}

export const CELL_STYLES: Record<CellStatus, {
  bg: string;
  text: string;
  border: string;
  icon: string;
  label: string;
}> = {
  CONFIRMED: {
    bg: '#ffffff',
    text: '#13294b',
    border: '#13294b',
    icon: '✓',
    label: 'Titulaire',
  },
  TRAINED_BACKUP: {
    bg: '#ffffff',
    text: '#1797D8',
    border: '#1797D8',
    icon: '●',
    label: 'Backup',
  },
  UNTRAINED_BACKUP: {
    bg: '#ede5de',
    text: '#13294b',
    border: '#13294b',
    icon: '⚠',
    label: 'Risque',
  },
  UNCOVERED: {
    bg: '#ded4c9',
    text: '#13294b',
    border: '#13294b',
    icon: '✕',
    label: 'Non couvert',
  },
  CLOSED: {
    bg: '#f8f9fa',
    text: '#c2c4c7',
    border: '#c2c4c7',
    icon: '—',
    label: 'Weekend / Fermé',
  },
  SIMULATION: {
    bg: '#F3E5F5',
    text: '#6B21A8',
    border: '#6B21A8',
    icon: '◉',
    label: 'Simulation',
  },
  ABSENT: {
    bg: '#fff5f5',
    text: '#e53e3e',
    border: '#e53e3e',
    icon: '!',
    label: 'Absent',
  },
};

export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  const monday = new Date(d.setDate(diff));

  return Array.from({ length: 7 }).map((_, i) => {
    const newDate = new Date(monday);
    newDate.setDate(monday.getDate() + i);
    return newDate;
  });
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  const days = [];
  const curr = new Date(start);
  curr.setHours(0,0,0,0);
  const last = new Date(end);
  last.setHours(0,0,0,0);
  while (curr <= last) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return days;
}

/** "Semaine du 28 Mar → 3 Avr 2026" */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const optsYear: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `Semaine du ${weekStart.toLocaleDateString('fr-FR', opts)} → ${weekEnd.toLocaleDateString('fr-FR', optsYear)}`;
}

/** Date ISO sans heure (Local Timezone Safe) */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
