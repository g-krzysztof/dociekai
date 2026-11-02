'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { OrbitConnector } from './orbit-connector';
import { AnimatedButton } from './animated-button';
import type { CourseConfig } from '@/lib/course-catalog';
import { img } from '@/lib/media';

interface CourseOrbitNodeProps {
  course: CourseConfig;
  index: number;
  hasTop: boolean;
  hasBottom: boolean;
}

export function CourseOrbitNode({ course, index, hasTop, hasBottom }: CourseOrbitNodeProps) {
  const Icon = course.icon;

  return (
    <motion.div
      className="flex gap-4 sm:gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
    >
      <OrbitConnector hasTop={hasTop} hasBottom={hasBottom} color={course.color}>
        <Link
          href={course.href}
          aria-label={`Otwórz kurs: ${course.title}`}
          className="group relative z-10 block h-16 w-16 shrink-0 cursor-pointer rounded-full outline-none sm:h-20 sm:w-20 lg:h-28 lg:w-28"
        >
          <span
            aria-hidden
            className="absolute -inset-2 rounded-full border border-dashed opacity-50 [animation:spin_18s_linear_infinite] motion-reduce:animate-none"
            style={{ borderColor: course.color }}
          />
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-25 blur-md transition-opacity duration-300 group-hover:opacity-50"
            style={{ background: course.color }}
          />
          <span
            className="relative block h-full w-full overflow-hidden rounded-full border-2 bg-background transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
            style={{ borderColor: course.color, boxShadow: `0 0 24px ${course.color}30` }}
          >
            {course.image ? (
              <Image src={img(course.image)} alt="" width={112} height={112} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center" style={{ color: course.color }}>
                <Icon className="h-1/2 w-1/2" strokeWidth={1.5} aria-hidden />
              </span>
            )}
          </span>
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background sm:h-7 sm:w-7 lg:h-8 lg:w-8"
            style={{ background: course.color }}
          >
            <Icon className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" strokeWidth={2.75} />
          </span>
          <span
            className="absolute -inset-1 rounded-full ring-2 ring-transparent group-focus-visible:ring-primary"
            aria-hidden
          />
        </Link>
      </OrbitConnector>

      <div className="min-w-0 flex-1 pb-10 sm:pb-14">
        <div
          className="relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-sm transition-colors duration-300 hover:bg-white dark:bg-zinc-900/60 dark:hover:bg-zinc-900/80"
          style={{ borderColor: `${course.color}35` }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-4 -top-8 select-none font-mono text-[6.5rem] font-bold leading-none opacity-[0.06] sm:-right-6 sm:-top-10 sm:text-[8.5rem]"
            style={{ color: course.color }}
          >
            {String(index).padStart(2, '0')}
          </span>

          <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                <Link href={course.href} className="outline-none hover:underline focus-visible:underline">
                  {course.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">{course.tagline}</p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {course.stats.map((stat) => (
                  <span
                    key={stat}
                    className="rounded-md border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    style={{ borderColor: `${course.color}40` }}
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:pl-4">
              <Link href={course.href} className="block outline-none">
                <AnimatedButton
                  animation="shimmer-border-glow"
                  glowColor={course.color}
                  shimmerColor={course.color}
                  glowRadius={6}
                  data-testid={`course-cta-${course.slug}`}
                  className="w-full gap-2 bg-background px-6 py-3 text-sm font-semibold text-foreground lg:w-auto"
                >
                  {course.ctaLabel}
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
