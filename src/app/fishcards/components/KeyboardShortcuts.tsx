'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';

export const KeyboardShortcuts: React.FC = () => {
  return (
    <Card className="hidden lg:block max-w-md w-100% mt-4">
      <CardContent>
        <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Skróty klawiszowe</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <Kbd>Spacja</Kbd>
            <span>Obróć fiszkę (fiszki)</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
            </div>
            <span>Poprzednia/Następna</span>
          </div>
          <div className="flex justify-between items-center">
            <Kbd>1</Kbd>
            <span>Wymowa</span>
          </div>
          <div className="flex justify-between items-center">
            <Kbd>0</Kbd>
            <span>Oznacz jako nauczone (fiszki)</span>
          </div>
          <div className="flex justify-between items-center">
            <Kbd>Enter</Kbd>
            <span>Sprawdź odpowiedź (quiz)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};