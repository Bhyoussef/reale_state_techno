import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  disabled?: boolean;
}

export function Card({
  className,
  children,
  isLoading = false,
  disabled = false,
  ...props
}: PropsWithChildren<CardProps>) {
  const isInactive = isLoading || disabled;

  return (
    <article
      className={cn(
        'hover-lift rounded-lg border border-border bg-background p-3 shadow-card transition-transform duration-300 hover:-translate-y-0.5 hover:border-neutral-300',
        isInactive && 'pointer-events-none opacity-70 hover:translate-y-0',
        className,
      )}
      aria-busy={isLoading}
      aria-disabled={isInactive}
      {...props}
    >
      {isLoading ? (
        <div className="flex min-h-20 items-center justify-center text-neutral-500">
          <Spinner size="md" />
        </div>
      ) : (
        children
      )}
    </article>
  );
}

export function CardHeader({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('mb-2 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
  return (
    <h3 className={cn('text-h5 text-foreground', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cn('text-body text-neutral-600 dark:text-neutral-500', className)} {...props}>
      {children}
    </div>
  );
}
