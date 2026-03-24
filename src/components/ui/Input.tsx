import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, hasError = false, isLoading = false, disabled, ...props },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        className={cn(
          'h-12 w-full rounded-md border bg-input px-2 pe-5 text-body text-foreground placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70',
          hasError ? 'border-error focus-visible:ring-error' : 'border-border hover:border-neutral-400',
          className,
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      />
      {isLoading ? (
        <span className="pointer-events-none absolute inset-y-0 end-2 inline-flex items-center text-neutral-500">
          <Spinner size="sm" />
        </span>
      ) : null}
    </div>
  );
});
