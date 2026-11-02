'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ width = 166, height = 40, className = 'h-10 w-auto', priority = false }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logo to plik z public/ — custom loader i tak go nie transformuje
  // (src/lib/media/loader.ts), stąd `unoptimized` na obu wariantach.
  if (!mounted) {
    return (
      <Image
        src="/images/logo-dociekai-sm.png"
        alt="DociekAI"
        width={width}
        height={height}
        className={className}
        priority={priority}
        unoptimized
      />
    );
  }

  const isDark = resolvedTheme === 'dark' || theme === 'dark';
  const logoSrc = isDark ? '/images/logo-dociekai-sm-darkmode.png' : '/images/logo-dociekai-sm.png';

  return (
    <Image
      src={logoSrc}
      alt="DociekAI"
      width={width}
      height={height}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
