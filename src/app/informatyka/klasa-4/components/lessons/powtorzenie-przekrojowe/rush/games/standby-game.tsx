'use client';

import { useState, type ComponentType } from 'react';
import { Box, Microwave, Refrigerator, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KettleIcon } from '../../../technologia-i-srodowisko/kettle-icon';
import type { GameProps } from '../types';

/**
 * Dział 8 — **WYŁĄCZ CZUWANIE!** Dom nocą, jak w `NightHouse`: trzy urządzenia
 * świecą lampką czuwania, a dwa to pułapki, których lekcja też pilnowała —
 * lodówka pracuje, a nie czuwa (jej się nie wyłącza), a czajnik w nocy nic
 * nie bierze (rekordzista mocy jest niewinny, bo nikt go nie włączył).
 */

interface Device {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  role: 'waste' | 'fridge' | 'kettle';
  led?: string;
}

const DEVICES: Device[] = [
  { id: 'tv', label: 'Telewizor', icon: Tv, role: 'waste', led: '#ef4444' },
  { id: 'fridge', label: 'Lodówka', icon: Refrigerator, role: 'fridge' },
  { id: 'micro', label: 'Mikrofalówka', icon: Microwave, role: 'waste', led: '#4ade80' },
  { id: 'kettle', label: 'Czajnik', icon: KettleIcon, role: 'kettle' },
  { id: 'box', label: 'Dekoder', icon: Box, role: 'waste', led: '#4ade80' },
];

export function StandbyGame({ finish }: GameProps) {
  const [off, setOff] = useState<string[]>([]);
  const wasteCount = DEVICES.filter((device) => device.role === 'waste').length;

  const tap = (device: Device) => {
    if (device.role === 'fridge' || device.role === 'kettle') {
      finish(false);
      return;
    }
    if (off.includes(device.id)) return;
    const next = [...off, device.id];
    setOff(next);
    if (next.length === wasteCount) finish(true);
  };

  return (
    <div className="flex h-full flex-col gap-2 bg-slate-900 p-3 text-slate-100">
      <p className="text-xs text-slate-300">Noc. Wszyscy śpią. Wyłącz to, co świeci lampką czuwania.</p>
      <div className="grid flex-1 grid-cols-3 content-center gap-2">
        {DEVICES.map((device) => {
          const Icon = device.icon;
          const isOff = off.includes(device.id);
          return (
            <button
              key={device.id}
              type="button"
              onClick={() => tap(device)}
              aria-label={`${device.label}${device.led && !isOff ? ', świeci lampka czuwania' : ''}`}
              className="relative flex min-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-1 border border-slate-600 bg-slate-800 px-1 py-2 text-xs font-semibold hover:bg-slate-700"
            >
              {device.led && (
                <span
                  aria-hidden
                  className={cn('absolute right-2 top-2 h-2.5 w-2.5 rounded-full transition-opacity', isOff && 'opacity-15')}
                  style={{ backgroundColor: device.led, boxShadow: isOff ? 'none' : `0 0 10px 3px ${device.led}` }}
                />
              )}
              <Icon className="h-7 w-7 text-slate-300" aria-hidden />
              {device.label}
              {isOff && <span className="text-[10px] text-emerald-400">0 W</span>}
            </button>
          );
        })}
      </div>
      <p className="text-xs tabular-nums text-slate-400">
        Wyłączone: {off.length}/{wasteCount}
      </p>
    </div>
  );
}
