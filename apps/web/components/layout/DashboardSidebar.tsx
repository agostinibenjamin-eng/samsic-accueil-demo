'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertCircle, PieChart } from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0 shadow-sm z-20">
      <div className="p-5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Aperçu & KPIs</h3>
        <nav className="flex-1 flex flex-col gap-1">
          <Link href="/" className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm "}>
            <LayoutDashboard size={16} /> Synthèse Globale
          </Link>
          <Link href="/alerts" className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all "}>
            <AlertCircle size={16} /> Alertes
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-50 transition-all">
            <PieChart size={16} /> Performance IA
          </Link>
        </nav>
      </div>
    </aside>
  );
}
