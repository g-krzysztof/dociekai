'use client';

import { GuideAct } from '../guide-act';
import { ZeroAudit } from './zero-audit';

export function ActUwagaNaZera({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <GuideAct id="uwaga-na-zera" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Uwaga na zera</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Zero po przecinku raz nic nie znaczy, a raz zmienia liczbę dziesięciokrotnie. Sprawdź
        wszystkie trzy zapisy na tej samej taśmie i zobacz, gdzie każdy z nich się kończy.
      </p>

      <ZeroAudit color={color} />

      <p className="mt-5 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: textColor }}>
        Reguła jest krótka: zero <strong>na końcu</strong> możesz dopisać albo skreślić — liczba
        zostaje ta sama. Zero <strong>zaraz za przecinkiem</strong> spycha wszystkie cyfry o jeden
        rząd dalej, więc każda z nich zaczyna znaczyć dziesięć razy mniej.
      </p>
    </GuideAct>
  );
}
