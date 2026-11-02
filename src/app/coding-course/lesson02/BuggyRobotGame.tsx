'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Pos = { x: number; y: number };
type Cmd = 'up' | 'left' | 'right' | 'pick';

export interface RobotGameConfig {
  GRID?: number;
  startRobot: Pos;
  applePos: Pos;
  obstacles?: Pos[];
}

export const BuggyRobotGame = ({ config, initialSequence }: { config: RobotGameConfig; initialSequence?: Cmd[] }) => {
  const GRID = config.GRID ?? 5;
  const startRobot = config.startRobot;
  const applePos = config.applePos;
  const obstacles = config.obstacles ?? [];

  const [robot, setRobot] = useState<Pos>(startRobot);
  // Program z błędami - ma niepotrzebne kroki, które trzeba usunąć
  const initialBuggySequence: Cmd[] = initialSequence ?? ['right', 'up', 'left', 'right', 'up', 'right', 'left', 'up', 'right', 'up', 'pick'];
  const [sequence, setSequence] = useState<Cmd[]>(initialBuggySequence);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);
  const [showCongrats, setShowCongrats] = useState<boolean>(false);

  const palette = useMemo<{ id: Cmd; label: string; icon: string }[]>(
    () => [
      { id: 'up', label: 'góra', icon: '⬆️' },
      { id: 'left', label: 'lewo', icon: '⬅️' },
      { id: 'right', label: 'prawo', icon: '➡️' },
      { id: 'pick', label: 'podnieś', icon: '🤖' },
    ],
    []
  );

  function withinGrid(pos: Pos) {
    return pos.x >= 0 && pos.x < GRID && pos.y >= 0 && pos.y < GRID;
  }

  function applyCommand(pos: Pos, cmd: Cmd): Pos {
    const next: Pos = { ...pos };
    if (cmd === 'up') next.y -= 1;
    if (cmd === 'left') next.x -= 1;
    if (cmd === 'right') next.x += 1;
    return next;
  }

  function isObstacleAt(pos: Pos) {
    return obstacles.some((o) => o.x === pos.x && o.y === pos.y);
  }

  async function runSequence() {
    if (isRunning || sequence.length === 0) return;
    setIsRunning(true);
    setLog([]);
    setShowCongrats(false);

    let pos = { ...robot };

    for (let i = 0; i < sequence.length; i++) {
      const cmd = sequence[i];
      await new Promise((res) => setTimeout(res, 600));

      const next = applyCommand(pos, cmd);

      if (isObstacleAt(next) && cmd !== 'pick') {
        setLog((l) => [...l, `Krok ${i + 1}: Robot uderzył w przeszkodę. To był błąd w programie!`]);
        setIsRunning(false);
        return;
      }

      if (!withinGrid(next)) {
        setLog((l) => [...l, `Krok ${i + 1}: Robot uderzył w ścianę! To był błąd w programie!`]);
        setIsRunning(false);
        return;
      }

      pos = next;
      setRobot({ ...pos });
      setLog((l) => [...l, `Krok ${i + 1}: Wykonano ${cmd}`]);

      if (cmd === 'pick' && pos.x === applePos.x && pos.y === applePos.y) {
        setLog((l) => [...l, `Brawo! Naprawiłeś program - robot zebrał jabłko! 🎉`]);
        setShowCongrats(true);
        setIsRunning(false);
        return;
      }

      if (pos.x === applePos.x && pos.y === applePos.y) {
        setLog((l) => [...l, `Robot stoi na jabłku. Użyj PODNIEŚ, aby je zebrać.`]);
      }
    }

    setIsRunning(false);
    setLog((l) => [...l, `Koniec sekwencji. Program nadal ma błędy - spróbuj usunąć więcej niepotrzebnych kroków.`]);
  }

  const dragIndexRef = useRef<number | null>(null);

  function onDragStart(e: React.DragEvent<HTMLDivElement>, idx: number) {
    dragIndexRef.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>, idx: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    const to = idx;
    if (from === null) return;
    const copy = [...sequence];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setSequence(copy);
    dragIndexRef.current = null;
  }

  useEffect(() => {
    setRobot(startRobot);
  }, [startRobot]);

  return (
    <div className="max-w-[1336px] mx-auto p-4">
      <main className="grid md:grid-cols-3 gap-4">
      <section className="md:col-span-1 bg-card rounded-xl shadow p-4">
        <h3 className="font-medium">Program z błędami</h3>
        <div className="text-xs text-muted-foreground mb-4">
          Ten program ma niepotrzebne polecenia! Usuń je, klikając × na każdym błędnym kroku.
          Możesz też zmieniać kolejność, przeciągając polecenia.
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Polecenia (usuń błędne kroki)</h3>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="min-h-[56px]">
                <div
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, i)}
                  className="min-h-[62px] p-2 rounded border border-dashed border-border flex items-center justify-center bg-popover">
                  {sequence[i] ? (
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, i)}
                      className="w-10 h-10 bg-card rounded shadow cursor-grab flex items-center justify-center relative">
                      <span className="text-base">{palette.find((p) => p.id === sequence[i])?.icon}</span>
                      <button
                        onClick={() => setSequence((s) => s.filter((_, idx) => idx !== i))}
                        className="absolute -top-2 -right-2 bg-card border-border rounded-full w-5 h-5 flex items-center justify-center text-xs text-red-500 cursor-pointer hover:bg-red-100">×</button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">({i + 1})</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => runSequence()}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer">
              Uruchom program!
            </button>
            <button
              onClick={() => {
                setRobot(startRobot);
                setSequence(initialBuggySequence);
                setLog([]);
                setShowCongrats(false);
              }}
              className="px-4 py-2 border border-border rounded cursor-pointer">Reset</button>
          </div>
        </div>
      </section>

      <section className="bg-card rounded-xl shadow p-4 flex flex-col gap-4 md:col-span-1">
        <div>
          <h3 className="font-medium">{`Plansza "Robo‑Krok"`}</h3>
          <p className="text-xs text-muted-foreground">{`Napraw program, aby robot dotarł do jabłka.`}</p>
        </div>

        <div className="w-full flex justify-center">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID}, 64px)`, gap: '4px' }}>
            {Array.from({ length: GRID }).map((_, row) => (
              <React.Fragment key={row}>
                {Array.from({ length: GRID }).map((__, col) => {
                  const x = col;
                  const y = row;
                  const isRobot = robot.x === x && robot.y === y;
                  const isApple = applePos.x === x && applePos.y === y;
                  const isObstacle = obstacles.some((o) => o.x === x && o.y === y);
                  return (
                    <div key={`${x}-${y}`} className="w-16 h-16 bg-card rounded flex items-center justify-center border border-border">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <AnimatePresence>
                          {isApple && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute text-2xl"
                            >
                              🍎
                            </motion.div>
                          )}

                          {isObstacle && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute text-xl"
                            >
                              🪨
                            </motion.div>
                          )}

                          {isRobot && (
                            <motion.div
                              key={`r-${x}-${y}`}
                              layout
                              initial={{ y: -10 }}
                              animate={{ y: 0 }}
                              className="absolute text-2xl"
                            >
                              🤖
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <aside className="bg-card rounded-xl shadow p-4 flex flex-col gap-4 md:col-span-1">
        <div>
          <h3 className="text-sm font-medium">Dziennik debugowania</h3>
          <p className="text-xs text-muted-foreground">Zobacz, gdzie program ma błędy i co się dzieje.</p>
        </div>

        <div className="bg-muted p-3 rounded max-h-96 overflow-auto text-sm">
          {log.length === 0 ? <div className="text-muted-foreground">Brak akcji - uruchom program, aby zobaczyć błędy</div> : log.map((l, idx) => <div key={idx}>{l}</div>)}
        </div>

        <div className="flex justify-between">
          <button onClick={() => { setLog([]); }} className="px-3 py-1 border border-border rounded text-sm cursor-pointer">Wyczyść dziennik</button>
          <button
            onClick={() => {
              setLog((l) => [...l, `💡 Wskazówka: Poprawny program powinien mieć około 5-6 kroków. Obecny ma ${sequence.length} kroków.`]);
            }}
            className="text-sm px-3 py-1 border border-border rounded cursor-pointer">Podpowiedź</button>
        </div>
      </aside>
      </main>

      <AnimatePresence>
        {showCongrats && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-6 rounded-xl shadow-lg max-w-sm text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h3 className="text-xl font-semibold">🎉 Świetna robota!</h3>
              <p className="mt-2">Znalazłeś i naprawiłeś błędy w programie! Robot zebrał jabłko.</p>
              <p className="mt-2 text-sm text-muted-foreground">To właśnie nazywamy debugowaniem - znajdowaniem i naprawianiem bugów!</p>
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => setShowCongrats(false)} className="px-4 py-2 border rounded">Zamknij</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuggyRobotGame;
