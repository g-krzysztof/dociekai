'use client';

import React from 'react';
import { SidebarRoot } from '@/components/ui/sidebar';

interface SetsSidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SetsSidebarProvider: React.FC<SetsSidebarProviderProps> = ({ 
  children, 
  defaultOpen = false 
}) => {
  return (
    <SidebarRoot defaultOpen={defaultOpen}>
      {children}
    </SidebarRoot>
  );
};