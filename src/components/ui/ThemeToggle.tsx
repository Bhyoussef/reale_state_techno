import { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export interface ThemeToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex h-10 items-center gap-1 rounded-md border border-border bg-background px-2 text-small font-medium text-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-100',
        className,
      )}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      {...props}
    >
      <span>{theme === 'light' ? '🌙' : '☀️'}</span>
      <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
