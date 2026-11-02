import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0..100
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value = 0, max = 100, ...props }, ref) => {
  const pct = Math.min(100, Math.max(0, (value / (max || 100)) * 100));
  return (
    <div ref={ref} className={cn('w-full bg-muted rounded-full h-3 overflow-hidden', className)} {...props}>
      <div
        className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };
