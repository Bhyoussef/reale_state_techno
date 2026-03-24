import { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground border border-primary hover:bg-primary/90 shadow-card disabled:hover:bg-primary',
  secondary:
    'bg-transparent text-primary border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800 disabled:hover:bg-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-2 text-small',
  md: 'h-12 px-3 text-body',
  lg: 'h-14 px-4 text-h6',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  isLoading = false,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      <span className="dir-aware-row dir-aware-space">
        {isLoading ? <Spinner /> : startIcon ? <span className="dir-aware-icon">{startIcon}</span> : null}
        <span>{children}</span>
        {!isLoading && endIcon ? <span className="dir-aware-icon">{endIcon}</span> : null}
      </span>
    </button>
  );
}
