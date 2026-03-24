import { ButtonHTMLAttributes } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../lib/cn';

export interface LanguageToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export function LanguageToggle({ className, ...props }: LanguageToggleProps) {
  const { language, toggleLanguage, isRTL } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={cn(
        'inline-flex h-10 items-center gap-1 rounded-md border border-border bg-background px-2 text-small font-medium text-foreground transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-100',
        className,
      )}
      aria-label={language === 'en' ? 'Switch language to Arabic' : 'التبديل إلى اللغة الإنجليزية'}
      {...props}
    >
      <span className={cn('text-neutral-500 transition-transform', isRTL ? 'rotate-180' : 'rotate-0')}>
        ⇄
      </span>
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
}
