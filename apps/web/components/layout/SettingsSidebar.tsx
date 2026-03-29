'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Cpu, Shield, Bell, Users, Database } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'engine', label: 'Moteur IA', icon: Cpu, href: '/settings' },
  { id: 'thresholds', label: 'Seuils & Règles', icon: Shield, href: '/settings#thresholds' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings#notifications' },
  { id: 'access', label: 'Accès Utilisateurs', icon: Users, href: '/settings#access' },
  { id: 'data', label: 'Données & Exports', icon: Database, href: '/settings#data' },
];

export function SettingsSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white border-r border-[#d5d0c8] flex flex-col h-full flex-shrink-0 z-20">
      <div className="p-6 border-b border-[#d5d0c8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-[#0A0A0A]">
            <Settings size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-body text-[#0A0A0A]">Paramètres</h2>
            <p className="text-[10px] text-[#6b6860] uppercase tracking-wider font-bold">Espace Administrateur</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-[10px] font-bold text-[#a09e97] uppercase tracking-widest px-3 mb-3">Configuration Globale</h3>
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold font-body transition-colors ${
                (pathname === item.href || (pathname === '/settings' && item.href === '/settings'))
                  ? 'bg-[#F5F3EF] text-[#0A0A0A]' /* Removed border constraint here just highlight bg */
                  : 'text-[#6b6860] hover:bg-[#F5F3EF] hover:text-[#0A0A0A]'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
