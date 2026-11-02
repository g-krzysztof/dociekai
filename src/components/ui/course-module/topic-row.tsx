'use client';

import { useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TopicRowProps {
  href: string;
  color: string;
  index: number;
  topic: ReactNode;
  /** Odznaka postępu / czas / „wkrótce" po prawej stronie wiersza. */
  status: ReactNode;
}

/**
 * Wiersz gotowego tematu ze "spotlightem" podążającym za kursorem — ten sam
 * pomysł co glow w DecorativeFrame (radial-gradient śledzący mysz), ale bez
 * cząsteczek/importu całego komponentu, bo tu chodzi tylko o jeden wiersz listy.
 */
export function TopicRow({ href, color, index, topic, status }: TopicRowProps) {
  const rowRef = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <Link
      ref={rowRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex items-start gap-4 overflow-hidden py-5 px-5"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(240px circle at ${pos.x}px ${pos.y}px, ${color}22, transparent 70%)`,
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />
      <span className="relative z-10 w-10 shrink-0 text-2xl font-black leading-none sm:text-3xl" style={{ color }}>
        {String(index).padStart(2, '0')}
      </span>
      <span className="relative z-10 flex-1 py-1 text-sm leading-relaxed sm:text-base">{topic}</span>
      <span className="relative z-10 mt-1 shrink-0">{status}</span>
    </Link>
  );
}
