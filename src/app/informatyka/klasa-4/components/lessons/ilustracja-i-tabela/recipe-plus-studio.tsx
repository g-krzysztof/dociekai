'use client';

import { useState } from 'react';
import { ImageIcon, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { imgMap } from '@/lib/media';
import { TaskShell } from '../../task-shell';
import { MiniWriter } from '../../mini-writer/mini-writer';
import {
  textBlock,
  toDoc,
  type WriterBlock,
  type WriterPicture,
} from '../../mini-writer/model';
import { DOC } from '../podzial-tekstu/recipe';
import {
  RECIPE_PLUS_CRITERIA,
  analyseRecipePlus,
  judgeRecipePlusContent,
  type RecipePlusAnalysis,
} from './recipe-plus';

/**
 * Zadanie praktyczne lekcji o ilustracji i tabeli — w całości w lekcji: dziecko
 * rozbudowuje gotowy przepis (ten sam, który pisało przy Z-10) o ilustrację
 * z banku i tabelę ze składnikami, a werdykt czyta ten sam `DocContent`, który
 * czytał z plików.
 *
 * Przepis stoi już w stylach — bez pamięci między lekcjami: dokument się
 * rozbudowuje warstwami, a nie pisze od nowa, więc materiał zaczyna się tam,
 * gdzie skończyła się poprzednia lekcja. Nagrodą jest **jego tabela
 * przerysowana na stronie, z pustymi komórkami na czerwono**.
 */

const PICTURE_SOURCES = imgMap({
  koktajl: '/images/informatyka/lekcje/podzial-tekstu/koktajl-truskawkowy.jpg',
});

const PICTURES: WriterPicture[] = [
  { id: 'koktajl', src: PICTURE_SOURCES.koktajl, name: 'koktajl z truskawkami' },
];

/** Gotowy przepis w stylach — punkt startu, nie praca do wykonania. */
function initialBlocks(): WriterBlock[] {
  return DOC.map((block) =>
    textBlock(block.text, {
      style: block.role === 'tytul' ? 'title' : block.role === 'naglowek' ? 'h2' : 'normal',
    })
  );
}

const CRITERIA = RECIPE_PLUS_CRITERIA.filter((item) => item.id !== 'dokument');

interface RecipePlusStudioProps {
  color: string;
  onComplete?: () => void;
}

export function RecipePlusStudio({ color, onComplete }: RecipePlusStudioProps) {
  const [blocks, setBlocks] = useState<WriterBlock[]>(initialBlocks);

  const judge = () => {
    const analysis = analyseRecipePlus(toDoc(blocks, PICTURES));
    return { verdicts: judgeRecipePlusContent(analysis), data: analysis };
  };

  const reset = () => {
    setBlocks(initialBlocks());
  };

  return (
    <TaskShell<RecipePlusAnalysis>
      color={color}
      brief={
        <>
          <p>
            <strong>Rozbuduj przepis niżej:</strong> wstaw ilustrację, dodaj tabelę ze
            składnikami i sprawdź pisownię. Na koniec pokaż gotowy przepis komuś z domowników —
            tak sprawdza się, czy dokument mówi sam za siebie.
          </p>
          <p className="mt-3">
            <strong>To ten sam przepis</strong>, nie nowy — dokumenty się rozbudowuje, a nie pisze
            od nowa. Sprawdzę, czy tytuł i tytuły etapów wciąż stoją na swoich stylach, a potem
            policzę komórki twojej tabeli, <strong>co do jednej</strong>.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={CRITERIA}
      workshop={
        <div>
          <p className="mb-2 text-sm leading-relaxed">
            Obraz wybierzesz przyciskiem <strong>„Wstaw obraz”</strong> na pasku narzędzi — stanie
            tam, gdzie stoi kursor. Kliknij go potem, żeby wybrać, czy ma stać{' '}
            <strong>w wierszu</strong>, czy <strong>obok tekstu</strong>. Tabelę wstawia przycisk{' '}
            <strong>„Wstaw tabelę”</strong>: dwie kolumny wystarczą („Składnik” i „Ile”), a każdy
            wiersz wypełnij do końca.
          </p>
          <MiniWriter
            color={color}
            blocks={blocks}
            onChange={setBlocks}
            tools={['undo', 'insert', 'arrange']}
            pictures={PICTURES}
            label="Twój rozbudowany przepis"
          />
        </div>
      }
      judge={judge}
      renderReport={(analysis) => <RecipePlusContentReport report={analysis} color={color} />}
      acceptedText={
        <>
          Przepis, który powstał dwie lekcje temu, ma teraz ilustrację i tabelę —{' '}
          <strong>bez ani jednej pustej komórki</strong>. To jest cały moduł o dokumentach w jednym
          miejscu: tytuł, śródtytuły, akapity, obraz i tabela, każde zrobione narzędziem do tego
          przeznaczonym.
        </>
      }
      onReset={reset}
      onComplete={onComplete}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Podgląd celu                                                        */
/* ------------------------------------------------------------------ */

function GoalPreview({ color }: { color: string }) {
  return (
    <div className="border bg-muted/20 p-3">
      <p className="mb-3 text-sm leading-relaxed">
        <strong>Tak ma wyglądać tabela</strong> — nagłówek w pierwszym wierszu i{' '}
        <strong>żadnej pustej komórki</strong>. Twoje składniki będą twoje.
      </p>
      <table className="w-full max-w-sm border-collapse text-sm">
        <tbody>
          {[
            ['Składnik', 'Ile'],
            ['truskawki', '2 garście'],
            ['jogurt naturalny', '1 kubek'],
            ['miód', '1 łyżeczka'],
          ].map((row, index) => (
            <tr key={row[0]}>
              {row.map((cell) => (
                <td
                  key={cell}
                  className={cn('border p-1.5', index === 0 && 'font-semibold')}
                  style={index === 0 ? { backgroundColor: `${color}14`, color } : undefined}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Pusta komórka w kolumnie „Ile” to <strong>pytanie bez odpowiedzi</strong> — dokładnie to,
        czego uczył blok o tabeli. Wypełnij ją albo skasuj cały wiersz.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport: jego tabela przerysowana                                    */
/* ------------------------------------------------------------------ */

function RecipePlusContentReport({ report, color }: { report: RecipePlusAnalysis; color: string }) {
  const { table } = report;
  const isEmpty = (row: number, column: number) =>
    report.empty.some((cell) => cell.row === row && cell.column === column);

  return (
    <div className="border bg-muted/20 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Table2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Twoja tabela, komórka po komórce
      </p>

      {table === null ? (
        <p className="mt-2 text-sm text-muted-foreground">
          W tym dokumencie nie ma jeszcze tabeli, więc nie mam czego przerysować.
        </p>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <tbody>
                {table.cells.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: table.columns }, (_, column) => {
                      const empty = isEmpty(rowIndex, column);
                      const header = rowIndex === 0 && report.headerRow;
                      return (
                        <td
                          key={column}
                          className={cn(
                            'border p-1.5 align-top leading-snug',
                            header && 'font-semibold',
                            empty && 'text-center text-xs'
                          )}
                          style={
                            empty
                              ? { backgroundColor: '#d4643a22', borderColor: '#d4643a', color: '#b4542f' }
                              : header
                                ? { backgroundColor: `${color}14`, color }
                                : undefined
                          }
                        >
                          {empty ? 'pusto' : row[column]}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {report.empty.length === 0
              ? `Tabela ${table.rows} × ${table.columns}, wszystkie komórki wypełnione. Ktoś, kto dostanie ten przepis, wie przy każdym składniku, ile go wziąć.`
              : 'Czerwone pola są puste. W dokumencie wyglądają jak odrobina wolnego miejsca, a dla czytającego są pytaniem bez odpowiedzi.'}
          </p>
        </>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Fact
          color={color}
          icon={ImageIcon}
          label="Obraz"
          value={
            report.images.length === 0
              ? 'brak'
              : report.imageWrap === 'float'
                ? 'obok tekstu — wiersze go opływają'
                : report.imageWrap === 'inline'
                  ? 'w tekście — jak bardzo duża litera'
                  : `${report.images.length} w dokumencie`
          }
        />
        <Fact
          color={color}
          icon={Table2}
          label="Przepis spod Z-10"
          value={
            report.title
              ? `tytuł + ${report.headings.length} ${report.headings.length === 1 ? 'tytuł etapu' : 'tytuły etapów'} na stylach`
              : 'nie rozpoznałam przepisu'
          }
        />
      </div>
    </div>
  );
}

function Fact({
  color,
  icon: Icon,
  label,
  value,
}: {
  color: string;
  icon: typeof ImageIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="border-l-2 pl-3" style={{ borderColor: `${color}66` }}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {label}
      </p>
      <p className="text-sm leading-snug">{value}</p>
    </div>
  );
}
