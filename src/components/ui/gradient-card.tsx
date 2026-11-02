import React from 'react';

interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'horizontal';
}

export function GradientCard({ 
  children, 
  className = '',
  variant = 'default'
}: GradientCardProps) {
  const getBaseClasses = () => {
    if (variant === 'horizontal') {
      return 'rounded-2xl w-full bg-gradient-to-r py-10 px-6 sm:px-8 lg:px-12';
    }
    return 'rounded-2xl w-full bg-gradient-to-b py-10 px-6 sm:px-8 lg:px-12';
  };
  
  const variantClasses = {
    default: 'from-slate-100 to-white dark:from-slate-800 dark:to-slate-900',
    subtle: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    horizontal: 'from-slate-100 to-white dark:from-slate-800 dark:to-slate-900',
  };

  return (
    <div className={`${getBaseClasses()} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
