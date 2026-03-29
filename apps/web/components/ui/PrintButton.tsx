'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 bg-white text-samsic-marine border border-samsic-marine-50 px-4 py-2 text-sm font-body font-semibold tracking-wide hover:bg-samsic-sable-30 transition-colors shadow-sm min-w-max print:hidden"
      title="Exporter en PDF ou Imprimer"
    >
      <Printer size={16} />
      <span>Exporter</span>
    </button>
  );
}
