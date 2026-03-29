'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function DashboardModal({ isOpen, onClose, title, children }: DashboardModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#24303b]/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-[#ede5de] w-full max-w-7xl h-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-l-4 border-samsic-sable">
        
        {/* Header SAMSIC */}
        <div className="bg-white border-b border-[#ded4c9] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-body font-black text-[#24303b] tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#ede5de] text-[#5c666e] hover:text-[#24303b] transition-colors"
            aria-label="Fermer"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {children}
        </div>
      </div>
    </div>
  );
}
