'use client';

import React from 'react';
import { Search, MapPin, Calendar, Filter, Users, Building2, Briefcase } from 'lucide-react';

interface PlanningSidebarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (term: string) => void;
  clientId: string;
  onClientFilterChange: (clientId: string) => void;
  employeeId: string;
  onEmployeeFilterChange: (employeeId: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  clientsList: { id: string; name: string }[];
  employeesList: { id: string; firstName: string; lastName: string }[];
}

export function PlanningSidebar({ 
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  searchQuery,
  onSearchChange, 
  clientId,
  onClientFilterChange, 
  employeeId,
  onEmployeeFilterChange,
  category,
  onCategoryChange,
  clientsList,
  employeesList
}: PlanningSidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full flex-shrink-0 shadow-sm z-20 overflow-y-auto">
      
      {/* Date Range Picker */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Période</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-bold text-samsic-marine uppercase mb-1 block">Début</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-samsic-marine focus:ring-2 focus:ring-samsic-bleu outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-samsic-marine uppercase mb-1 block">Fin</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-semibold text-samsic-marine focus:ring-2 focus:ring-samsic-bleu outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-5 flex-1 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filtres</h3>
          <button 
            onClick={() => {
              onSearchChange('');
              onClientFilterChange('ALL');
              onEmployeeFilterChange('ALL');
              onCategoryChange('ALL');
            }}
            className="text-[10px] text-samsic-bleu font-bold bg-samsic-bleu/10 px-2 py-1 rounded-full hover:bg-samsic-bleu/20 transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        {/* Global Search */}
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-samsic-bleu transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par poste..." 
            value={searchQuery}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-samsic-bleu-30 transition-all focus:bg-white"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter Categories */}
        <div className="space-y-4">
          
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
              <Building2 size={12} /> Clients
            </label>
            <select
              value={clientId}
              onChange={(e) => onClientFilterChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-semibold text-samsic-marine appearance-none shadow-sm focus:ring-2 focus:ring-samsic-bleu outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Tous les Clients</option>
              {clientsList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
              <Users size={12} /> Employés
            </label>
            <select
              value={employeeId}
              onChange={(e) => onEmployeeFilterChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-semibold text-samsic-marine appearance-none shadow-sm focus:ring-2 focus:ring-samsic-bleu outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Tous les Employés</option>
              {employeesList.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
              <Briefcase size={12} /> Catégories / Secteur
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-semibold text-samsic-marine appearance-none shadow-sm focus:ring-2 focus:ring-samsic-bleu outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Toutes Catégories</option>
              <option value="Banque">Banque</option>
              <option value="Juridique">Juridique</option>
              <option value="Tech">Tech</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
          
        </div>
      </div>
    </aside>
  );
}
