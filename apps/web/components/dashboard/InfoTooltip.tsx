'use client';

/**
 * InfoTooltip — Composant d'aide "bulle info" léger
 * @samsic-design-system — Affiche une icône Info ou Help, au survol montre un texte explicatif.
 */

import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  variant?: 'light' | 'dark';
}

export function InfoTooltip({ content, variant = 'light' }: InfoTooltipProps) {
  const iconColor = variant === 'light' 
    ? "text-samsic-marine-50 hover:text-samsic-marine" 
    : "text-samsic-sable-50 hover:text-white";
    
  return (
    <div className="group relative inline-flex items-center justify-center -translate-y-px">
      <Info size={14} className={`${iconColor} transition-colors cursor-help`} />
      
      {/* Tooltip (affiché au :hover) */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-[240px] z-50">
        <div className="bg-samsic-marine text-white text-xs font-body p-3 shadow-lg relative">
          {content}
          
          {/* Flèche vers le bas */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-samsic-marine border-t-8 border-x-transparent border-x-8 border-b-0"></div>
        </div>
      </div>
    </div>
  );
}
