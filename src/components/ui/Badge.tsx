import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'success' | 'error' | 'accent';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-200 dark:text-neutral-700',
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
  accent: 'bg-accent/20 text-accent-foreground',
};

export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-small font-medium',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
