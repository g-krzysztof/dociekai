import type { DiagnosticTask } from '../../diagnostic-quiz';
import { BarModel } from '../../bar-model';

/** Ćwiczenia: dokańczanie rysunku, rozpoznawanie pasującego rysunku i podpuchy w treści. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'kieszonkowe',
      prompt: "Rysunek pokazuje zadanie: „Miałam 50 zł, wydałam 22 zł. Ile mi zostało?” Dokończ obliczenie.",
      type: 'input',
      answer: '28',
      unit: 'zł',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: (
        <BarModel
          color={color}
          spec={{ type: 'part-whole', wholeLabel: 'złotych na starcie', wholeValue: 50, parts: [{ label: 'wydane', value: 22 }, { label: 'zostało', value: null }] }}
          size="sm"
        />
      ),
      explanation: '50 zł − 22 zł = 28 zł.',
    },
    {
      id: 'pudelka-cukierkow',
      prompt: '4 jednakowe pudełka mają razem 48 cukierków. Ile cukierków jest w jednym pudełku?',
      type: 'input',
      answer: '12',
      difficulty: { code: 'K', name: 'Konieczne' },
      visual: <BarModel color={color} spec={{ type: 'equal-groups', groupLabel: 'pudełko', unitLabel: 'cukierków', groups: 4, perGroup: null, total: 48 }} size="sm" />,
      explanation: '48 : 4 = 12 cukierków w jednym pudełku.',
    },
    {
      id: 'ktore-zadanie-os',
      prompt: 'Które zadanie najlepiej narysujesz na osi liczbowej?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: 'O ile wzrosła temperatura od −3°C do 5°C' },
        { id: 'b', text: 'Ile w sumie waży 5 jednakowych paczek' },
        { id: 'c', text: 'Ile kosztuje 3 bilety po 12 zł' },
        { id: 'd', text: 'Jaki jest obwód kwadratu o boku 6 cm' },
      ],
      correctId: 'a',
      explanation: 'To skok od jednej wartości do drugiej wzdłuż skali — dokładnie do tego służy oś liczbowa.',
    },
    {
      id: 'po-co-rysunek',
      prompt: 'Dlaczego rysunek pomocniczy naprawdę pomaga przy zadaniu tekstowym?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: 'Bo zawsze daje gotowy wynik, bez liczenia' },
        { id: 'b', text: 'Bo zastępuje czytanie treści zadania' },
        { id: 'c', text: 'Bo porządkuje dane i pokazuje, jakiego działania użyć' },
        { id: 'd', text: 'Bo jest wymagany w każdym zadaniu przez nauczyciela' },
      ],
      correctId: 'c',
      explanation: 'Rysunek nie liczy za ciebie — układa dane tak, żeby było widać, które działanie pasuje.',
    },
    {
      id: 'wycieczka-suma',
      prompt: 'Na wycieczkę pojechało 17 chłopców i 19 dziewczynek. Ilu uczniów pojechało razem?',
      type: 'input',
      answer: '36',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      visual: <BarModel color={color} spec={{ type: 'part-whole', wholeLabel: 'uczniów razem', wholeValue: null, parts: [{ label: 'chłopcy', value: 17 }, { label: 'dziewczynki', value: 19 }] }} size="sm" />,
      explanation: '17 + 19 = 36 uczniów.',
    },
    {
      id: 'podpucha-kot',
      prompt: 'W zadaniu pojawia się zdanie: „Kot sąsiadów ma 4 lata.” Ta liczba to...',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: 'Dana potrzebna do obliczeń' },
        { id: 'b', text: 'Wynik całego zadania' },
        { id: 'c', text: 'Najważniejsza liczba w zadaniu' },
        { id: 'd', text: 'Liczba niepotrzebna do obliczeń — podpucha' },
      ],
      correctId: 'd',
      explanation: 'Wiek kota nie ma nic wspólnego z pytaniem zadania — to typowa podpucha, którą rysunek pomocniczy pomija.',
    },
  ];
}
