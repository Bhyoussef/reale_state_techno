import { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/cn';
import { useLanguage } from '../../context/LanguageContext';

export interface RTLLayoutProps extends HTMLAttributes<HTMLDivElement> {}

export function RTLLayout({ className, children, ...props }: PropsWithChildren<RTLLayoutProps>) {
  const { direction, language } = useLanguage();

  return (
    <div
      lang={language}
      dir={direction}
      className={cn('min-h-screen bg-background text-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}
