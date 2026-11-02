import { Typography } from '@/components/ui/typography';
import { ReactNode } from 'react';

interface HeroTitleProps {
  children: ReactNode;
  className?: string;
}

export function HeroTitle({ children, className = '' }: HeroTitleProps) {
  return (
    <Typography
      variant="h1"
      className={`bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </Typography>
  );
}
