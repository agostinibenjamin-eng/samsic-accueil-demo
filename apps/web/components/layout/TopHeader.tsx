/**
 * TopHeader SAMSIC — Navigation principale SaaS
 * @samsic-design-system — Header moderne, séparé du sidebar
 * @react-patterns — Composant client
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Building2,
  CalendarOff,
  BellRing,
  Upload,
  Settings,
  Search,
  Bell,
  Menu
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/planning', icon: CalendarDays, label: 'Planning' },
  { href: '/employees', icon: Users, label: 'Employés' },
  { href: '/clients', icon: Building2, label: 'Clients' },
  { href: '/absences', icon: CalendarOff, label: 'Absences' },
  { href: '/alerts', icon: BellRing, label: 'Alertes' },
  { href: '/import', icon: Upload, label: 'Import' },
];

export function TopHeader() {
  const pathname = usePathname();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex flex-shrink-0 items-center px-4 md:px-6 justify-between z-40 sticky top-0 shadow-sm w-full">
      {/* Left section: Logo + Brand */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 flex-shrink-0 overflow-hidden rounded-md shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow">
            <Image
              src="/samsic-logo.png"
              alt="SAMSIC Facility"
              width={32}
              height={32}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-samsic-marine font-display font-black text-sm tracking-widest leading-none">
              SAMSIC
            </div>
            <div className="text-samsic-marine-50 text-[10px] font-body tracking-[0.2em] uppercase mt-0.5">
              Accueil
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-body font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-samsic-sable-30/50 text-samsic-marine shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-samsic-marine'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-samsic-bleu' : ''} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right section: Search, Notifications, User */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-gray-400 group-focus-within:text-samsic-bleu transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-sm font-body focus:outline-none focus:ring-2 focus:ring-samsic-bleu-30 focus:bg-white transition-all w-48 lg:w-64"
          />
        </div>

        {/* Action icons */}
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-samsic-marine hover:bg-gray-50 rounded-full transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <Link href="/settings" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-samsic-marine hover:bg-gray-50 rounded-full transition-colors">
          <Settings size={18} />
        </Link>

        {/* User Profile */}
        <button className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-samsic-bleu to-samsic-bleu-80 rounded-full flex items-center justify-center shadow-sm text-white font-bold text-xs">
            MD
          </div>
          <div className="hidden lg:flex flex-col items-start min-w-0 pr-1">
            <span className="text-sm font-bold text-samsic-marine truncate max-w-[120px]">Mandy De Melo</span>
            <span className="text-[10px] text-gray-500 font-medium">Planificateur</span>
          </div>
        </button>

        {/* Mobile menu toggle */}
        <button className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg">
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
