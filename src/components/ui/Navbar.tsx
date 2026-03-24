import { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { Spinner } from './Spinner';

export interface NavbarItem {
  label: string;
  href: string;
  disabled?: boolean;
}

export interface NavbarProps {
  logo?: ReactNode;
  items: NavbarItem[];
  action?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Navbar({ logo = 'TechnoHouse', items, action, isLoading = false, disabled = false }: NavbarProps) {
  const isInactive = isLoading || disabled;

  return (
    <nav
      className={cn(
        'dir-aware-row justify-between rounded-lg border border-border bg-background px-3 py-2 shadow-sm',
        isInactive && 'opacity-80',
      )}
      aria-busy={isLoading}
      aria-disabled={isInactive}
    >
      <div className="text-h6 font-semibold text-primary">{logo}</div>

      <div className="dir-aware-row dir-aware-space text-small text-neutral-600 dark:text-neutral-500">
        {isLoading ? (
          <Spinner />
        ) : (
          items.map((item) => (
            <a
              key={item.href}
              href={item.disabled || isInactive ? undefined : item.href}
              aria-disabled={item.disabled || isInactive}
              className={cn(
                'rounded-sm px-1 py-1 transition-colors',
                item.disabled || isInactive
                  ? 'pointer-events-none opacity-50'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-100',
              )}
            >
              {item.label}
            </a>
          ))
        )}
      </div>

      <div>
        {action ?? (
          <Button variant="primary" size="sm" disabled={isInactive} isLoading={isLoading}>
            Contact
          </Button>
        )}
      </div>
    </nav>
  );
}
