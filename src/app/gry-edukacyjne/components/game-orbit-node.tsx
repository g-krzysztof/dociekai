'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import type { GameConfig } from '../data/games';
import { OrbitConnector } from '@/components/ui/orbit-connector';

interface GameOrbitNodeProps {
  game: GameConfig;
  index: number;
  hasTop: boolean;
  hasBottom: boolean;
  statLabel?: string | null;
}

export function GameOrbitNode({ game, index, hasTop, hasBottom, statLabel }: GameOrbitNodeProps) {
  const Icon = game.icon;
  const href = `/gry-edukacyjne/${game.slug}`;

  return (
    <motion.div
      className="flex gap-4 sm:gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
    >
      <OrbitConnector hasTop={hasTop} hasBottom={hasBottom} color={game.color}>
        <Link
          href={href}
          aria-label={`Otwórz misję: ${game.title}`}
          className="group relative z-10 block h-16 w-16 shrink-0 rounded-full outline-none sm:h-20 sm:w-20 lg:h-28 lg:w-28 cursor-pointer"
        >
          <span
            aria-hidden
            className="absolute -inset-2 rounded-full border border-dashed opacity-40 [animation:spin_18s_linear_infinite] motion-reduce:animate-none"
            style={{ borderColor: game.color }}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-40 blur-md transition-opacity duration-300 group-hover:opacity-70"
            style={{ background: game.color }}
          />
          <span
            className="relative block h-full w-full overflow-hidden rounded-full border-2 transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
            style={{ borderColor: game.color, boxShadow: `0 0 26px ${game.color}55` }}
          >
            {/* plik z public/ — custom loader i tak go nie transformuje (src/lib/media/loader.ts) */}
            <Image src={game.image} alt="" fill sizes="112px" className="object-cover" unoptimized />
          </span>
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#05070f] sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            style={{ background: game.color }}
          >
            <Icon className="h-3 w-3 text-[#05070f] sm:h-3.5 sm:w-3.5" strokeWidth={2.75} />
          </span>
          <span className="absolute -inset-1 rounded-full ring-2 ring-transparent group-focus-visible:ring-white/70" aria-hidden />
        </Link>
      </OrbitConnector>

      <div className="min-w-0 flex-1 pb-10 sm:pb-14">
        <div
          className="relative overflow-hidden rounded-2xl border bg-white/[0.03] backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.05]"
          style={{ borderColor: `${game.color}35` }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-8 select-none font-mono text-[6.5rem] font-bold leading-none opacity-[0.07] sm:-right-6 sm:-top-10 sm:text-[8.5rem]"
            style={{ color: game.color }}
          >
            {String(index).padStart(2, '0')}
          </span>

          <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                <Link href={href} className="outline-none hover:underline focus-visible:underline">
                  {game.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-white/60 sm:text-base">{game.tagline}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70">{game.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border px-2.5 py-1 text-xs font-medium text-white/70"
                    style={{ borderColor: `${game.color}40` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {statLabel && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/50">
                  <Trophy aria-hidden className="h-3.5 w-3.5" style={{ color: game.color }} />
                  {statLabel}
                </p>
              )}
            </div>

            <div className="lg:pl-4">
              <Link href={href} className="block outline-none">
                <AnimatedButton
                  animation="shimmer-border-glow"
                  glowColor={game.color}
                  shimmerColor={game.color}
                  glowRadius={6}
                  data-testid={`game-cta-${game.slug}`}
                  className="w-full gap-2 px-6 py-3 text-sm font-semibold text-white lg:w-auto"
                  style={{ backgroundColor: `${game.color}14` }}
                >
                  {game.ctaLabel}
                  <span aria-hidden>→</span>
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
