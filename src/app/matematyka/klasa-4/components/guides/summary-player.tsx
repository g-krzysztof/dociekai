'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AudioLines, FileText, Pause, Play } from 'lucide-react';
import { DecorativeFrame } from '@/components/decorative-frame';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const BAR_COUNT = 24;
/** Wysokości słupków „zamrożonej" fali dźwiękowej — deterministyczne, więc identyczne na serwerze i kliencie. */
const BAR_LEVELS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const wave = Math.sin(i * 0.7) * 0.5 + Math.sin(i * 1.9 + 1) * 0.35;
  return 0.28 + Math.abs(wave) * 0.68;
});

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

interface SummaryPlayerProps {
  color: string;
  /** Ścieżka do mp3 z nagraniem TTS, np. `/audio/matematyka/przewodniki/<slug>/streszczenie.mp3`. */
  audioSrc: string;
  /** Treść modala „Przeczytaj streszczenie" — zwykle `<SummaryDisplay color={color} />` z lokalnego `summary-content.tsx` przewodnika. */
  children: ReactNode;
}

/**
 * Odtwarzacz streszczenia przewodnika — czyta nagranie TTS
 * (ElevenLabs przez Replicate). Współdzielony przez wszystkie przewodniki (promowany tu po
 * trzecim konsumencie, ta sama zasada co przy `NumberLine`/`FactTriangle`):
 * treść streszczenia (`children`) i plik audio (`audioSrc`) są specyficzne dla
 * przewodnika, więc zostają w jego własnym `summary-content.tsx`.
 */
export function SummaryPlayer({ color, audioSrc, children }: SummaryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const playActive = isPlaying || isHovering;

  const handleToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleSeekKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    let next = audio.currentTime;
    if (event.key === 'ArrowRight') next += 5;
    else if (event.key === 'ArrowLeft') next -= 5;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = duration;
    else return;
    event.preventDefault();
    next = Math.min(duration, Math.max(0, next));
    audio.currentTime = next;
    setCurrentTime(next);
  };

  // Serwerowo wyrenderowany <audio> zaczyna wczytywać metadane, zanim React
  // zdąży się zahydrować i podpiąć onLoadedMetadata/onDurationChange — jeśli
  // czas wczytania wygrał z hydracją, zdarzenie już minęło, więc trzeba
  // dociągnąć wartość ręcznie przy montowaniu.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
  }, []);

  return (
    <DecorativeFrame
      className="lg:w-[300px]"
      glowingBorder
      glowColor={color}
      glowRadius={130}
      particleSize={3}
      particleCountDesktop={18}
      particleCountTablet={14}
      particleCountMobile={10}
    >
      <div className="flex items-center gap-2">
        <AudioLines className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: textColor }}>
          Odsłuchaj streszczenie
        </span>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
        }}
        onError={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="mt-4 flex items-center gap-3">
        <motion.button
          type="button"
          onClick={handleToggle}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? 'Zatrzymaj streszczenie' : 'Odtwórz streszczenie'}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.94 }}
          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center border transition-colors"
          style={{
            borderColor: color,
            backgroundColor: playActive ? `${color}14` : 'transparent',
            color,
          }}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" fill="currentColor" aria-hidden />
          ) : (
            <Play className="h-5 w-5" fill="currentColor" aria-hidden />
          )}
        </motion.button>

        <div className="flex h-10 flex-1 items-end gap-[3px]" aria-hidden>
          {BAR_LEVELS.map((level, i) => (
            <motion.span
              key={i}
              className="w-full min-w-[2px]"
              style={{
                height: `${level * 100}%`,
                backgroundColor: color,
                opacity: isPlaying ? 1 : 0.32,
                transformOrigin: 'bottom',
              }}
              animate={isPlaying ? { scaleY: [1, 0.42 + (i % 5) * 0.14, 1] } : { scaleY: 1 }}
              transition={
                isPlaying
                  ? {
                      duration: 0.5 + (i % 6) * 0.12,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                      delay: (i % 7) * 0.04,
                    }
                  : { duration: 0.2 }
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-xs tabular-nums text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div
        role="slider"
        aria-label="Postęp odtwarzania streszczenia"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, Math.round(duration))}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={`${formatTime(currentTime)} z ${formatTime(duration)}`}
        aria-disabled={duration <= 0}
        tabIndex={duration > 0 ? 0 : -1}
        onClick={handleSeek}
        onKeyDown={handleSeekKeyDown}
        className="group/seek mt-1 flex h-4 cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{ ['--tw-ring-color' as string]: color }}
      >
        <div className="h-1 w-full overflow-hidden bg-muted transition-[height] group-hover/seek:h-1.5">
          <div
            className="h-full transition-[width] duration-150"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 border-t pt-3 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: textColor, borderTopColor: `${color}33` }}
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden />
            Przeczytaj streszczenie
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Streszczenie</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </DecorativeFrame>
  );
}
