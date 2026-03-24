import { PropsWithChildren } from 'react';
import { LanguageProvider } from '../../context/LanguageContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { Footer, LanguageToggle, Navbar, ThemeToggle } from '../ui';
import { RTLLayout } from './RTLLayout';

export interface MainLayoutProps {
  navItems?: Array<{ label: string; href: string; disabled?: boolean }>;
  footerLinks?: Array<{ label: string; href: string }>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function MainLayout({
  children,
  navItems = [
    { label: 'Buy', href: '/buy' },
    { label: 'Rent', href: '/rent' },
    { label: 'Agents', href: '/agents' },
    { label: 'Contact', href: '/contact' },
  ],
  footerLinks = [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Help Center', href: '/help' },
  ],
  isLoading = false,
  disabled = false,
}: PropsWithChildren<MainLayoutProps>) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RTLLayout className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-50">
          <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-3 lg:px-4">
              <Navbar
                items={navItems}
                isLoading={isLoading}
                disabled={disabled}
                action={
                  <div className="dir-aware-row dir-aware-space">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                }
              />
            </div>
          </header>

          <main className="page-transition mx-auto w-full max-w-7xl flex-1 px-2 py-4 sm:px-3 lg:px-4">{children}</main>

          <div className="mx-auto w-full max-w-7xl px-2 pb-3 sm:px-3 lg:px-4">
            <Footer links={footerLinks} isLoading={isLoading} disabled={disabled} />
          </div>
        </RTLLayout>
      </LanguageProvider>
    </ThemeProvider>
  );
}
