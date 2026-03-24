import { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md';
}

export function Spinner({ className, size = 'sm', ...props }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-r-transparent',
        size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
