'use client';

import { useEffect, useRef } from 'react';
import { useSamsicStore } from '@/lib/store/use-samsic-store';

export function StoreInitializer() {
  const initializeData = useSamsicStore(state => state.initializeData);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializeData();
    }
  }, [initializeData]);

  return null;
}
