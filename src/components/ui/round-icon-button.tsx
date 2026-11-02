'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  robot: {
    src: '/images/icons/robot.jpg',
    alt: 'Robot',
  },
  dice: {
    src: '/images/icons/dice.jpg',
    alt: 'Dice',
  },
  email: {
    src: '/images/icons/email.jpg',
    alt: 'Email',
  },
  blog: {
    src: '/images/icons/blog.jpg',
    alt: 'Blog',
  },
} as const;

export type RoundIconButtonIcon = keyof typeof ICON_MAP;

interface RoundIconButtonProps {
  icon: RoundIconButtonIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { button: 'w-14 h-14', image: 56, label: 'text-xs mt-1.5' },
  md: { button: 'w-20 h-20', image: 80, label: 'text-sm mt-2' },
  lg: { button: 'w-28 h-28', image: 112, label: 'text-base mt-2.5' },
};

export function RoundIconButton({
  icon,
  label,
  href,
  onClick,
  disabled = false,
  size = 'md',
  className,
}: RoundIconButtonProps) {
  const { src, alt } = ICON_MAP[icon];
  const { button, image, label: labelClass } = sizeMap[size];

  const sharedClassName = cn(
    'group flex flex-col items-center cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    className,
  );

  const content = (
    <>
      <span
        className={cn(
          'relative rounded-full overflow-hidden ring-2 ring-transparent',
          'transition-all duration-200',
          'group-hover:ring-primary group-hover:scale-105 group-hover:shadow-md',
          'group-active:scale-95',
          button,
        )}
      >
        <Image
          src={src}
          alt={alt}
          width={image}
          height={image}
          className="object-cover w-full h-full"
        />
      </span>
      <span className={cn('text-foreground font-medium leading-tight text-center', labelClass)}>
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={sharedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={sharedClassName}>
      {content}
    </button>
  );
}
