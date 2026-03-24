import { PropsWithChildren, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { Spinner } from './Spinner';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  footer?: ReactNode;
}

export function Modal({
  isOpen,
  title,
  onClose,
  children,
  footer,
  isLoading = false,
  disabled = false,
}: PropsWithChildren<ModalProps>) {
  if (!isOpen) {
    return null;
  }

  const isInactive = isLoading || disabled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/55 p-2">
      <div
        className={cn(
          'w-full max-w-3xl rounded-lg border border-border bg-background p-3 shadow-card transition-all',
          isInactive && 'opacity-90',
        )}
        role="dialog"
        aria-modal="true"
        aria-busy={isLoading}
        aria-disabled={isInactive}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-h5">{title}</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isInactive}
            aria-label="Close modal"
          >
            ✕
          </Button>
        </div>

        <div className="min-h-12 text-body text-neutral-600 dark:text-neutral-500">
          {isLoading ? (
            <div className="flex min-h-20 items-center justify-center text-neutral-500">
              <Spinner size="md" />
            </div>
          ) : (
            children
          )}
        </div>

        <div className="mt-3 dir-aware-row justify-end dir-aware-space">
          {footer ?? (
            <Button variant="secondary" onClick={onClose} disabled={isInactive}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
