import Link from 'next/link';
import { Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModuleBySlug } from '../data/curriculum';

/**
 * Gdzie w programie faktycznie mieszka każda z umiejętności „zadania tekstowe
 * i logika” — indeksy w `MathModule.lessons` modułu-gospodarza. Docelowy temat
 * (tekst, kolor, numer modułu) czytamy stąd z `curriculum.ts`, żeby nie
 * duplikować treści i nie móc się rozjechać, gdy ktoś zmieni brzmienie tematu.
 */
const SKILL_THREAD_ANCHORS: { moduleSlug: string; topicIndex: number }[] = [
  { moduleSlug: 'liczby-naturalne', topicIndex: 11 },
  { moduleSlug: 'liczby-naturalne', topicIndex: 12 },
  { moduleSlug: 'dzialania-pisemne', topicIndex: 6 },
  { moduleSlug: 'geometria', topicIndex: 11 },
  { moduleSlug: 'geometria', topicIndex: 12 },
];

/**
 * Wątek przecinający półkę roku w poprzek: umiejętność, która nie ma własnego
 * grzbietu, bo mieszka w środku pięciu innych. Stąd forma jednego wąskiego
 * paska pod półką, a nie kolejnego działu — brak własnego grzbietu jest tu
 * celowym sygnałem.
 */
export function SkillThreadNote({ className }: { className?: string }) {
  const anchors = SKILL_THREAD_ANCHORS.map(({ moduleSlug, topicIndex }) => {
    const hostModule = getModuleBySlug(moduleSlug);
    const topic = hostModule?.lessons[topicIndex];
    if (!hostModule || !topic) return null;
    return { hostModule, topic, topicIndex };
  }).filter((anchor): anchor is NonNullable<typeof anchor> => anchor !== null);

  return (
    <aside className={cn('flex items-start gap-3 border-t pt-4', className)}>
      <Puzzle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <h2 className="text-base font-bold sm:text-lg">
          Zadania tekstowe i logika — przez cały rok, bez własnego grzbietu
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Czytanie treści zadania, szacowanie wyniku, rysunek pomocniczy i układanie własnych
          łamigłówek nie są osobnym działem do odhaczenia — wchodzą do działów powyżej dokładnie
          tam, gdzie są potrzebne:{' '}
          {anchors.map(({ hostModule, topic, topicIndex }, index) => (
            <span key={`${hostModule.slug}-${topicIndex}`}>
              {index > 0 && ' · '}
              <Link
                href={`/matematyka/klasa-4/${hostModule.slug}#temat-${topicIndex + 1}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                <span
                  className="font-mono text-xs font-bold tabular-nums"
                  style={{ color: `color-mix(in oklch, ${hostModule.color} 84%, black)` }}
                >
                  {String(hostModule.number).padStart(2, '0')}
                </span>{' '}
                {topic}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </aside>
  );
}
