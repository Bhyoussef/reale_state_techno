import { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  isLoading?: boolean;
}

export function Select({
  options,
  className,
  placeholder = 'Select option',
  isLoading = false,
  disabled,
  ...props
}: SelectProps) {
  const isDisabled = disabled || isLoading;

  return (
    <div className="relative w-full">
      <select
        className={cn(
          'h-12 w-full appearance-none rounded-md border border-border bg-input px-2 pe-8 text-body text-foreground transition-colors hover:border-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70',
          className,
        )}
        disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 end-2 inline-flex items-center text-neutral-500">
        {isLoading ? <Spinner size="sm" /> : '⌄'}
      </span>
    </div>
  );
}
