'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useLektor } from '../../../lib/lektor';
import { AUDIO as NIC_AUDIO } from './film.nic_mi.audio';
import { DLUGOSC, KLATKI, ZMIANY, judgeStop, judgeWiara, poseAt, type Poza, type Wiara } from './film';

/**
 * L4, blok 2 „Niemy film” `[1.7]` — **gest nowy dla kursu: zatrzymuje film
 * bez dźwięku w chwili, w której ciało zaczyna mówić coś innego.** Scena SVG:
 * Tymek wraca z przegranego meczu. Sędzia czyta te same klatki kluczowe, z
 * których powstaje animacja (`film.ts`). Potem film z dźwiękiem — „Nic mi nie
 * jest.” — i pytanie (dopiero po kwestii): komu wierzysz? Odpowiedź musi
 * podeprzeć klatka; „słowom” podpiera tylko klatka sprzed zmiany, więc dostaje
 * komentarz korygujący zamiast przyjęcia (uwaga testera 2026-10-18). Termin
 * „komunikat niewerbalny” (z tonem głosu) na końcu.
 */

const r1 = (v: number) => Math.round(v * 10) / 10;

/** Tymek narysowany z pozy. Wszystkie współrzędne zaokrąglone (hydracja). */
export const figX = (p: Poza) => r1(20 + p.x * 2.4);

function Tymek({ p }: { p: Poza }) {
  const hipX = figX(p);
  const hipY = 108;
  const ground = 150;
  const shY = r1(70 + p.ramiona * 7);
  const shX = r1(hipX + p.ramiona * 4);
  const half = r1(13 - p.ramiona * 3);
  const headX = r1(shX + p.glowa * 5);
  const headY = r1(shY - 17 + p.glowa * 9);
  // Nogi: w marszu nożyce, w miejscu lekki rozkrok.
  const stride = p.krok * 14;
  const f1 = [r1(hipX - 5 + stride), ground];
  const f2 = [r1(hipX + 5 - stride), ground];
  // Ręce z łokciami: zwis (z kołysaniem) → skrzyżowane na piersi.
  const sw = p.krok * 8 * (1 - p.ramiona);
  const arm = (s: 1 | -1) => {
    const sx = r1(shX + s * half);
    const hang = { ex: sx + s * 3 + s * sw * 0.5, ey: shY + 18, hx: sx + s * 4 + s * sw, hy: shY + 36 };
    const cross = { ex: sx + s * 6, ey: shY + 17, hx: shX - s * 9, hy: shY + 13 };
    const L = (a: number, b: number) => r1(a + (b - a) * p.rece);
    return { sx, sy: shY + 2, ex: L(hang.ex, cross.ex), ey: L(hang.ey, cross.ey), hx: L(hang.hx, cross.hx), hy: L(hang.hy, cross.hy) };
  };
  const a1 = arm(-1);
  const a2 = arm(1);
  const eyeY = r1(headY + p.glowa * 3);
  const Arm = ({ a, c }: { a: ReturnType<typeof arm>; c: string }) => (
    <g stroke={c} strokeWidth="6" strokeLinecap="round" fill="none">
      <polyline points={`${a.sx},${a.sy} ${a.ex},${a.ey} ${a.hx},${a.hy}`} strokeLinejoin="round" />
      <circle cx={a.hx} cy={a.hy} r="3.2" fill="#f6dcc8" stroke="none" />
    </g>
  );
  return (
    <g>
      <line x1={r1(hipX - 4)} y1={hipY} x2={f1[0]} y2={f1[1]} stroke="#6b7a3a" strokeWidth="8" strokeLinecap="round" />
      <line x1={r1(hipX + 4)} y1={hipY} x2={f2[0]} y2={f2[1]} stroke="#59672f" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx={f1[0]} cy={ground} rx="6" ry="3" fill="#3b5bdb" />
      <ellipse cx={f2[0]} cy={ground} rx="6" ry="3" fill="#3b5bdb" />
      {p.rece < 0.5 && <Arm a={a1} c="#e07a2c" />}
      <path d={`M ${r1(hipX - 11)} ${hipY + 2} L ${r1(shX - half)} ${shY} L ${r1(shX + half)} ${shY} L ${r1(hipX + 11)} ${hipY + 2} Z`} fill="#f08a3c" />
      {[0.33, 0.66].map((f) => (
        <line key={f} x1={r1(shX - half + (hipX - 11 - shX + half) * f)} y1={r1(shY + (hipY + 2 - shY) * f)} x2={r1(shX + half + (hipX + 11 - shX - half) * f)} y2={r1(shY + (hipY + 2 - shY) * f)} stroke="#9ca3af" strokeWidth="3" />
      ))}
      <rect x={r1(hipX - 11)} y={hipY - 2} width="22" height="8" fill="#6b7a3a" />
      {p.rece >= 0.5 && <Arm a={a1} c="#e07a2c" />}
      <Arm a={a2} c="#f08a3c" />
      <rect x={r1(shX - 3)} y={r1(shY - 6)} width="6" height="7" fill="#f6dcc8" />
      <circle cx={headX} cy={headY} r="12" fill="#f6dcc8" />
      <path d={`M ${r1(headX - 12)} ${r1(headY - 3)} Q ${r1(headX - 10)} ${r1(headY - 15)} ${headX} ${r1(headY - 14)} Q ${r1(headX + 11)} ${r1(headY - 15)} ${r1(headX + 12)} ${r1(headY - 4)} L ${r1(headX + 7)} ${r1(headY - 8)} L ${r1(headX + 2)} ${r1(headY - 5)} L ${r1(headX - 4)} ${r1(headY - 8)} Z`} fill="#d9772b" />
      <circle cx={r1(headX - 4)} cy={eyeY} r="1.5" fill="#2d2a26" />
      <circle cx={r1(headX + 4)} cy={eyeY} r="1.5" fill="#2d2a26" />
      <path d={`M ${r1(headX - 4)} ${r1(eyeY + 6)} Q ${headX} ${r1(eyeY + 6 + (p.ramiona > 0.5 ? -2 : 2))} ${r1(headX + 4)} ${r1(eyeY + 6)}`} stroke="#7a2e2e" strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Scena({ t, mowi }: { t: number; mowi: boolean }) {
  const p = poseAt(t);
  return (
    <svg viewBox="0 0 300 160" className="block w-full" role="img" aria-label="Podwórko kamienicy: Tymek wraca z meczu">
      <rect x="0" y="0" width="300" height="160" fill="#f7efe2" />
      <rect x="0" y="20" width="300" height="100" fill="#efe1c6" />
      {[30, 90, 150, 210, 270].map((x) => (
        <rect key={x} x={x - 12} y="36" width="24" height="30" fill="#dfe8ef" stroke="#c9b48f" />
      ))}
      <rect x="0" y="140" width="300" height="20" fill="#cdb48e" />
      <rect x="0" y="118" width="300" height="24" fill="#d9c7a6" />
      {/* bramka z dwóch plecaków i piłka pod murem */}
      <rect x="236" y="126" width="12" height="14" fill="#2f4a6d" />
      <rect x="270" y="126" width="12" height="14" fill="#7a3b3b" />
      <circle cx="18" cy="133" r="7" fill="#fff" stroke="#555" />
      {/* wynik meczu kredą na murze: drużyna Tymka przegrała */}
      <g fill="#fdfcf7" stroke="#fdfcf7" fontFamily="sans-serif">
        <rect x="232" y="84" width="54" height="26" fill="none" strokeWidth="1.2" strokeDasharray="3 2" />
        <text x="259" y="94" fontSize="6.5" textAnchor="middle" stroke="none">MY : ONI</text>
        <text x="259" y="106" fontSize="10" textAnchor="middle" stroke="none" fontWeight="bold">2 : 5</text>
      </g>
      <Tymek p={p} />
      {mowi && (
        <g>
          <rect x={r1(figX(p) + 18)} y="30" width="92" height="22" fill="#fff" stroke="#333" />
          <text x={r1(figX(p) + 64)} y="45" fontSize="10" textAnchor="middle" fill="#111">
            Nic mi nie jest.
          </text>
        </g>
      )}
    </svg>
  );
}

interface Props {
  color: string;
  onComplete: () => void;
}

export function NiemyFilm({ color, onComplete }: Props) {
  const lektor = useLektor(NIC_AUDIO);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);
  const [caught, setCaught] = useState<string[]>([]);
  const [msg, setMsg] = useState('Puść film i zatrzymaj go, kiedy Tymek zaczyna wyglądać inaczej. Bez dźwięku patrzysz tylko na ciało.');
  const [wiara, setWiara] = useState<Wiara | null>(null);
  const [dowod, setDowod] = useState<{ ok: boolean; mowi: string } | null>(null);
  // Pytanie pada dopiero po kwestii Tymka — nie zanim ją usłyszysz.
  const [slyszal, setSlyszal] = useState(false);
  const said = useRef(false);
  const last = useRef<number | null>(null);

  const allCaught = ZMIANY.every((z) => caught.includes(z.id));
  const done = !!dowod?.ok;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    let raf = 0;
    const step = (now: number) => {
      const prev = last.current ?? now;
      last.current = now;
      setT((cur) => {
        const next = Math.min(DLUGOSC, cur + (now - prev) / 1000);
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    if (t >= DLUGOSC && playing) setPlaying(false);
    if (sound && playing && t >= 8.3 && !said.current) {
      said.current = true;
      lektor.playOne('nic');
    }
    if (sound && t >= 9.4 && !slyszal) setSlyszal(true);
  }, [t, playing, sound, lektor, slyszal]);

  const stop = () => {
    setPlaying(false);
    const res = judgeStop(t);
    if (res.ok) {
      setCaught((c) => (c.includes(res.zmiana) ? c : [...c, res.zmiana]));
      setMsg(`Złapane: ${res.label}. ${caught.length + (caught.includes(res.zmiana) ? 0 : 1) === ZMIANY.length ? 'Obie zmiany złapane!' : 'Jest jeszcze jedna zmiana — puść dalej.'}`);
    } else setMsg(res.mowi);
  };

  const playSound = () => {
    said.current = false;
    setSound(true);
    setT(0);
    setPlaying(true);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="mx-auto max-w-[560px] border">
        <Scena t={t} mowi={sound && t >= 8.3} />
      </div>
      <div className="mx-auto mt-2 flex max-w-[560px] flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (t >= DLUGOSC) setT(0);
            setPlaying((p) => !p);
          }}
          className="flex h-10 w-10 items-center justify-center text-white"
          style={{ backgroundColor: color }}
          aria-label={playing ? 'Pauza' : 'Odtwórz film'}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={DLUGOSC * 10}
          value={Math.round(t * 10)}
          onChange={(e) => {
            setPlaying(false);
            setT(Number(e.target.value) / 10);
          }}
          className="min-w-0 flex-1 cursor-ew-resize"
          style={{ accentColor: color }}
          aria-label="Przewijanie filmu"
        />
        <span className="w-10 text-right font-mono text-xs tabular-nums">{t.toFixed(1)} s</span>
        {!sound && (
          <button type="button" onClick={stop} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
            Stop! Tu się zmienia
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 min-h-[2.75rem] max-w-[560px] text-sm leading-snug" aria-live="polite">
        {!sound && msg}
      </p>
      <div className="mx-auto flex max-w-[560px] flex-wrap gap-2 text-xs">
        {ZMIANY.map((z) => (
          <span key={z.id} className="flex items-center gap-1 border px-2 py-1" style={{ borderColor: caught.includes(z.id) ? '#059669' : undefined }}>
            {caught.includes(z.id) ? <Check className="h-3 w-3 text-emerald-600" /> : '?'} {caught.includes(z.id) ? z.label : 'zmiana do złapania'}
          </span>
        ))}
      </div>

      {allCaught && (
        <div className="mx-auto mt-4 max-w-[560px] border-t pt-3">
          {!sound ? (
            <button type="button" onClick={playSound} className="flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color, borderColor: color }}>
              <Volume2 className="h-4 w-4" /> Teraz z dźwiękiem
            </button>
          ) : !slyszal ? (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Patrz i słuchaj, co Tymek powie.
            </p>
          ) : (
            <>
              <p className="text-sm leading-relaxed sm:text-base">
                Tymek mówi: „Nic mi nie jest.” <strong>Komu wierzysz bardziej — słowom czy ciału?</strong> Wybierz, a potem stuknij
                klatkę, która to pokazuje.
              </p>
              <div className="mt-2 flex gap-2">
                {(['slowom', 'cialu'] as Wiara[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    aria-pressed={wiara === w}
                    onClick={() => {
                      setWiara(w);
                      setDowod(null);
                    }}
                    className="border px-3 py-1.5 text-sm"
                    style={{ borderColor: wiara === w ? color : undefined, fontWeight: wiara === w ? 600 : undefined }}
                  >
                    {w === 'slowom' ? 'słowom' : 'ciału'}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {KLATKI.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    disabled={!wiara || done}
                    onClick={() => wiara && setDowod(judgeWiara(wiara, k.id))}
                    className="border p-1 disabled:opacity-50"
                    aria-label={`Klatka z ${k.t}. sekundy`}
                  >
                    <svg viewBox={`${figX(poseAt(k.t)) - 36} 40 72 116`} className="mx-auto block h-24 w-auto">
                      <rect x={figX(poseAt(k.t)) - 36} y="40" width="72" height="116" fill="#f7efe2" />
                      <rect x={figX(poseAt(k.t)) - 36} y="148" width="72" height="8" fill="#cdb48e" />
                      <Tymek p={poseAt(k.t)} />
                    </svg>
                    <span className="block text-center text-[11px] text-muted-foreground">{k.t}. sekunda</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 min-h-[2.75rem] text-sm leading-snug" aria-live="polite" style={{ color: dowod?.ok ? '#047857' : undefined }}>
                {dowod?.mowi}
              </p>
              {done && (
                <p className="text-sm leading-relaxed sm:text-base">
                  Wszystko, co mówisz bez słów — mina, postawa, ręce, krok, a także ton głosu — to{' '}
                  <strong>komunikat niewerbalny</strong>. Czasem zgadza się ze słowami, a czasem nie. Kiedy się nie zgadza,
                  ludzie zwykle bardziej wierzą ciału.
                </p>
              )}
              {!done && (
                <button type="button" onClick={playSound} className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5" /> Obejrzyj jeszcze raz
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
