'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  anyConsistent,
  CASES,
  DEFINITIONS,
  firstConflict,
  socratesObjection,
  type Answers,
  type Definition,
} from './sokrates';

interface Msg {
  who: 'sokrates' | 'ty';
  text: string;
}

const FINAL: Record<Definition['id'], string> = {
  'brak-strachu': 'Ostatnie pytanie. Kamień też się niczego nie boi. Czy kamień jest odważny?',
  niebezpieczne:
    'Ostatnie pytanie. Ktoś przebiega przez ruchliwą ulicę na czerwonym świetle, bo nie chce mu się czekać. Robi coś niebezpiecznego. Czy jest odważny?',
  'mimo-strachu':
    'Ostatnie pytanie. Twoja definicja mówi o tym, co „słuszne”. A kto decyduje, co jest słuszne? Ty? Ja? Król? Każdy myśli trochę inaczej.',
};

/**
 * Blok 4 — **Rozmowa z Sokratesem** (rozmowa w stylu Sokratesa, wymyślona).
 * Gest: dziecko podaje definicję odwagi i mówi o kolejnych osobach, czy są
 * odważne; Sokrates pokazuje, gdzie definicja przeczy jego własnym słowom,
 * a dziecko zmienia definicję. Kończy się na „wiem, że nic nie wiem”.
 */
export function SokratesWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [log, setLog] = useState<Msg[]>([
    {
      who: 'sokrates',
      text: 'Witaj! Jestem Sokrates. Chodzę po agorze i zadaję ludziom pytania. Wszyscy mówią o odwadze — ale czym ona właściwie jest? Powiedz mi.',
    },
  ]);
  const [def, setDef] = useState<Definition | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<'define' | 'answer' | 'redefine' | 'end'>('define');
  const reported = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'end' && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [mode, onDone]);

  useEffect(() => {
    // Przewija tylko okno rozmowy, nie stronę.
    const box = boxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
  }, [log.length]);

  const say = (...msgs: Msg[]) => setLog((l) => [...l, ...msgs]);

  const askCase = (i: number): Msg => {
    const c = CASES[i];
    return { who: 'sokrates', text: `${c.story} Czy ${c.yes.replace(' jest ', ' jest twoim zdaniem ')}?` };
  };

  const finish = (d: Definition, extra: Msg[] = []) => {
    say(...extra, { who: 'sokrates', text: FINAL[d.id] });
    setMode('end');
  };

  const chooseDef = (d: Definition) => {
    setDef(d);
    const me: Msg = { who: 'ty', text: d.text };
    if (mode === 'define') {
      say(me, { who: 'sokrates', text: 'Dobrze. Sprawdźmy twoją definicję na kilku ludziach.' }, askCase(0));
      setMode('answer');
      return;
    }
    const conflict = firstConflict(d.id, answers);
    if (conflict) {
      say(me, { who: 'sokrates', text: socratesObjection(d, conflict, answers[conflict.id]) });
      return;
    }
    const next = idx + 1;
    const ok: Msg = { who: 'sokrates', text: 'Sprawdzam po kolei wszystkich, o których mówiliśmy… Tak, teraz zgadza się z każdym.' };
    if (next >= CASES.length) finish(d, [me, ok]);
    else {
      setIdx(next);
      say(me, ok, askCase(next));
      setMode('answer');
    }
  };

  const answer = (yes: boolean) => {
    if (!def) return;
    const c = CASES[idx];
    const nextAnswers = { ...answers, [c.id]: yes };
    setAnswers(nextAnswers);
    const me: Msg = { who: 'ty', text: yes ? `Tak, ${c.yes.replace(/^\S+ /, '')}.` : `Nie, ${c.no.replace(/^\S+ /, '')}.` };
    const conflict = firstConflict(def.id, nextAnswers);
    if (conflict) {
      if (!anyConsistent(nextAnswers)) {
        say(me, {
          who: 'sokrates',
          text: 'Hm. Sprawdziłem wszystkie trzy definicje — żadna nie zgadza się ze wszystkim, co powiedziałeś/łaś. A przecież na początku wydawało się, że wiemy, czym jest odwaga!',
        });
        setMode('end');
        return;
      }
      say(me, { who: 'sokrates', text: socratesObjection(def, conflict, nextAnswers[conflict.id]) });
      setMode('redefine');
      return;
    }
    const next = idx + 1;
    if (next >= CASES.length) finish(def, [me]);
    else {
      setIdx(next);
      say(me, { who: 'sokrates', text: 'Zgadza się z twoją definicją. Idźmy dalej.' }, askCase(next));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Rozmowa w stylu Sokratesa — wymyślona przez nas, ale tak właśnie rozmawiał.
      </p>
      <div ref={boxRef} className="max-h-[26rem] space-y-2 overflow-y-auto border bg-[#f6f1e4] p-3 dark:bg-zinc-900/60">
        {log.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('max-w-[88%] border px-3 py-2 text-sm leading-relaxed', m.who === 'ty' ? 'ml-auto bg-white dark:bg-zinc-900' : 'bg-white/70 dark:bg-zinc-800')}
            style={m.who === 'ty' ? { borderColor: color } : undefined}
          >
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {m.who === 'ty' ? 'Ty' : 'Sokrates'}
            </span>
            {m.text}
          </motion.div>
        ))}
      </div>

      {(mode === 'define' || mode === 'redefine') && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {mode === 'define' ? 'Twoja definicja' : 'Zmień definicję'}
          </p>
          {DEFINITIONS.filter((d) => mode === 'define' || d.id !== def?.id).map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => chooseDef(d)}
              className="block w-full border-2 bg-white px-3 py-2 text-left text-sm dark:bg-zinc-900"
              style={{ borderColor: 'var(--border)' }}
            >
              {d.text}
            </button>
          ))}
        </div>
      )}

      {mode === 'answer' && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => answer(true)} className="border-2 bg-white px-3 py-2 text-sm font-semibold dark:bg-zinc-900" style={{ borderColor: color }}>
            Tak, odważn{CASES[idx].yes.endsWith('a') ? 'a' : 'y'}
          </button>
          <button type="button" onClick={() => answer(false)} className="border-2 bg-white px-3 py-2 text-sm font-semibold dark:bg-zinc-900" style={{ borderColor: color }}>
            Nie
          </button>
        </div>
      )}

      {mode === 'end' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p className="text-base italic">„Wiem, że nic nie wiem.”</p>
          <p>
            Tak mówił o sobie Sokrates, ateński filozof z V wieku p.n.e. Nie twierdził, że jest mądrzejszy od innych —
            tylko że on przynajmniej wie, czego nie wie. Rozmawiał z każdym na agorze i pytaniami pokazywał, że to, co
            wydaje się oczywiste, wcale takie nie jest.
          </p>
          <p>
            <strong>Filozofia</strong> to po grecku „umiłowanie mądrości”. Nie polega na znaniu odpowiedzi, tylko na
            zadawaniu dobrych pytań. Właśnie to robiłeś/łaś: sprawdzałeś/łaś, czy twoje zdanie zgadza się z tym, co
            naprawdę myślisz. Sokrates nie napisał ani słowa — jego rozmowy spisał uczeń, Platon.
          </p>
        </motion.div>
      )}
    </div>
  );
}
