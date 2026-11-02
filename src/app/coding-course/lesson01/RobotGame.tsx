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

export const RobotGame = ({ config }: { config: RobotGameConfig }) => {
  const GRID = config.GRID ?? 5;
  const startRobot = config.startRobot;
  const applePos = config.applePos;
  const obstacles = config.obstacles ?? [];

  const [robot, setRobot] = useState<Pos>(startRobot);
  const [sequence, setSequence] = useState<Cmd[]>([]);
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
        setLog((l) => [...l, `Krok ${i + 1}: Robot uderzył w przeszkodę.`]);
        setIsRunning(false);
        return;
      }

      if (!withinGrid(next)) {
        setLog((l) => [...l, `Krok ${i + 1}: Robot uderzył w ścianę!`]);
        setIsRunning(false);
        return;
      }

      pos = next;
      setRobot({ ...pos });
      setLog((l) => [...l, `Krok ${i + 1}: Wykonano ${cmd}`]);

      if (cmd === 'pick' && pos.x === applePos.x && pos.y === applePos.y) {
        setLog((l) => [...l, `Brawo! Zebrałeś jabłko.`]);
        setShowCongrats(true);
        setIsRunning(false);
        return;
      }

      if (pos.x === applePos.x && pos.y === applePos.y) {
        setLog((l) => [...l, `Robot stoi na jabłku. Użyj PODNIEŚ, aby je zebrać.`]);
      }
    }

    setIsRunning(false);
    setLog((l) => [...l, `Koniec sekwencji. Nie zebrano jabłka.`]);
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
    setSequence([]);
  }, [startRobot]);

  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
      <section className="lg:col-span-1 bg-card rounded-xl shadow p-3 sm:p-4">
        <h3 className="font-medium text-sm sm:text-base">Kliknij, aby dodać polecenie do programu.</h3>
        <div className="text-xs text-muted-foreground mb-3 sm:mb-4">Uwaga: robot musi wykonać polecenie PODNIEŚ będąc na polu z jabłkiem, aby je zebrać.</div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
          {palette.map((p) => (
            <button
              key={p.id}
              onClick={() => setSequence((s) => [...s, p.id])}
              className="flex-1 min-w-[70px] sm:min-w-[120px] px-2 py-1 rounded-md border border-border shadow-sm hover:shadow-md flex items-center gap-1 sm:gap-2 text-xs sm:text-sm cursor-pointer justify-center"
              aria-label={`Dodaj ${p.label}`}>
              <span className="text-base sm:text-lg">{p.icon}</span>
              <span className="font-medium text-xs sm:text-sm">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-medium mb-2">Polecenia (można przeciągać, żeby zmienić kolejność)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="min-h-[48px] sm:min-h-[56px]">
                <div
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, i)}
                  className="min-h-[48px] sm:min-h-[62px] p-1 sm:p-2 rounded border border-dashed border-border flex items-center justify-center bg-popover">
                  {sequence[i] ? (
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, i)}
                      className="w-8 h-8 sm:w-10 sm:h-10 bg-card rounded shadow cursor-grab flex items-center justify-center relative">
                      <span className="text-sm sm:text-base">{palette.find((p) => p.id === sequence[i])?.icon}</span>
                      <button
                        onClick={() => setSequence((s) => s.filter((_, idx) => idx !== i))}
                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-card border-border rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs text-red-500 cursor-pointer">×</button>
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
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer text-xs sm:text-sm">
              Uruchom program!
            </button>
            <button
              onClick={() => {
                setRobot(startRobot);
                setSequence([]);
                setLog([]);
                setShowCongrats(false);
              }}
              className="px-3 sm:px-4 py-2 border border-border rounded cursor-pointer text-xs sm:text-sm">Reset</button>
          </div>
        </div>
      </section>

      <section className="bg-card rounded-xl shadow p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 lg:col-span-1">
        <div>
          <h3 className="font-medium text-sm sm:text-base">{`Plansza "Robo‑Krok"`}</h3>
          <p className="text-xs text-muted-foreground">{`Gdy klikniesz guzik "Uruchom", robot wykona program.`}</p>
        </div>

        <div className="w-full flex justify-center overflow-x-auto">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID}, minmax(48px, 64px))`, gap: '4px' }}>
            {Array.from({ length: GRID }).map((_, row) => (
              <React.Fragment key={row}>
                {Array.from({ length: GRID }).map((__, col) => {
                  const x = col;
                  const y = row;
                  const isRobot = robot.x === x && robot.y === y;
                  const isApple = applePos.x === x && applePos.y === y;
                  const isObstacle = obstacles.some((o) => o.x === x && o.y === y);
                  return (
                    <div key={`${x}-${y}`} className="w-12 h-12 sm:w-16 sm:h-16 bg-card rounded flex items-center justify-center border border-border">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <AnimatePresence>
                          {isApple && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="absolute text-lg sm:text-2xl"
                            >
                              🍎
                            </motion.div>
                          )}

                          {isObstacle && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute text-base sm:text-xl"
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
                              className="absolute text-lg sm:text-2xl"
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

      <aside className="bg-card rounded-xl shadow p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 lg:col-span-1">
        <div>
          <h3 className="text-sm font-medium">Dziennik</h3>
          <p className="text-xs text-muted-foreground">Tutaj zapisywane są kroki i podpowiedzi programu.</p>
        </div>

        <div className="bg-muted p-2 sm:p-3 rounded max-h-60 sm:max-h-96 overflow-auto text-xs sm:text-sm">
          {log.length === 0 ? <div className="text-muted-foreground">Brak akcji</div> : log.map((l, idx) => <div key={idx}>{l}</div>)}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <button onClick={() => { setLog([]); }} className="px-3 py-1 border border-border rounded text-xs sm:text-sm cursor-pointer">Wyczyść dziennik</button>
          <button
            onClick={() => {
              const hints: string[] = [];
              let tx = robot.x;
              let ty = robot.y;
              while (tx < applePos.x) { hints.push('right'); tx++; }
              while (tx > applePos.x) { hints.push('left'); tx--; }
              while (ty < applePos.y) { hints.push('up'); ty++; }
              while (ty > applePos.y) { hints.push('up'); ty--; }
              setLog((l) => [...l, `Podpowiedź (niepełna): ${hints.map((h) => h.toUpperCase()).join(', ')}`]);
            }}
            className="text-xs sm:text-sm px-3 py-1 border border-border rounded cursor-pointer">Podpowiedź</button>
        </div>
      </aside>
      </main>

      <AnimatePresence>
        {showCongrats && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg max-w-sm w-full text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <h3 className="text-lg sm:text-xl font-semibold">Brawo!</h3>
              <p className="mt-2 text-sm sm:text-base">Zebrałeś jabłko — napisałeś poprawnie działający program!</p>
              <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => setShowCongrats(false)} className="px-4 py-2 border rounded text-sm sm:text-base">Zamknij</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RobotGame;
