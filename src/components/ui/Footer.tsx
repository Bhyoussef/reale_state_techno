import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface FooterProps {
  companyName?: string;
  links?: Array<{ label: string; href: string }>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function Footer({
  companyName = 'TechnoHouse',
  links = [],
  isLoading = false,
  disabled = false,
}: FooterProps) {
  const isInactive = isLoading || disabled;

  return (
    <footer
      className={cn('rounded-lg border border-border bg-background px-3 py-3', isInactive && 'opacity-80')}
      aria-busy={isLoading}
      aria-disabled={isInactive}
    >
      <div className="dir-aware-row justify-between">
        <p className="text-small text-neutral-500">© {new Date().getFullYear()} {companyName}</p>
        <div className="dir-aware-row dir-aware-space">
          {links.map((link) => (
            <a
              key={link.href}
              href={isInactive ? undefined : link.href}
              className={cn(
                'text-small text-neutral-600 transition-colors',
                isInactive
                  ? 'pointer-events-none opacity-50'
                  : 'hover:text-primary hover:underline underline-offset-2',
              )}
            >
              {link.label}
            </a>
          ))}
          <Button size="sm" variant="secondary" disabled={isInactive} isLoading={isLoading}>
            Subscribe
          </Button>
        </div>
      </div>
    </footer>
  );
}
