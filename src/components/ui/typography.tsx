import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl leading-tight lg:leading-[64px]',
      h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 leading-tight',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight leading-tight',
      h4: 'scroll-m-20 text-xl font-semibold tracking-tight leading-tight',
      h5: 'scroll-m-20 text-xs font-semibold tracking-tight leading-tight',
      h6: 'scroll-m-20 text-base font-semibold tracking-tight leading-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-6',
      blockquote: 'mt-6 border-l-2 pl-6 italic leading-relaxed',
      lead: 'text-xl text-muted-foreground leading-relaxed',
      large: 'text-lg font-semibold leading-relaxed',
      small: 'text-sm font-medium leading-normal',
      muted: 'text-sm text-muted-foreground leading-normal',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    const Comp = as || getDefaultElement(variant);
    return <Comp className={cn(typographyVariants({ variant, className }))} ref={ref} {...props} />;
  }
);

Typography.displayName = 'Typography';

function getDefaultElement(variant: TypographyProps['variant']) {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'h5':
      return 'h5';
    case 'blockquote':
      return 'blockquote';
    case 'lead':
    case 'large':
    case 'small':
    case 'muted':
    case 'p':
    default:
      return 'p';
  }
}

export { Typography, typographyVariants };
