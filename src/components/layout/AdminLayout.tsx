import { PropsWithChildren, useMemo, useState } from 'react';
import { LanguageProvider } from '../../context/LanguageContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';
import { LanguageToggle, ThemeToggle } from '../ui';

type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  icon?: string;
};

export interface AdminLayoutProps {
  pageTitle: string;
  navItems?: AdminNavItem[];
  activeKey?: string;
}

const defaultNavItems: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: '📊' },
  { key: 'properties', label: 'Properties', href: '/admin/properties', icon: '🏘️' },
  { key: 'agents', label: 'Agents', href: '/admin/agents', icon: '🧑‍💼' },
  { key: 'messages', label: 'Messages', href: '/admin/messages', icon: '💬' },
  { key: 'users', label: 'Users', href: '/admin/users', icon: '👥' },
  { key: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function AdminLayout({
  children,
  pageTitle,
  navItems = defaultNavItems,
  activeKey = 'dashboard',
}: PropsWithChildren<AdminLayoutProps>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeLabel = useMemo(
    () => navItems.find((item) => item.key === activeKey)?.label ?? pageTitle,
    [activeKey, navItems, pageTitle],
  );

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-neutral-100 text-foreground dark:bg-neutral-50">
          <div className="flex min-h-screen">
            <button
              type="button"
              className={cn(
                'fixed inset-0 z-40 bg-primary/35 transition-opacity md:hidden',
                isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close admin navigation"
            />

            <aside
              className={cn(
                'fixed inset-y-0 start-0 z-50 w-72 border-e border-border bg-background p-3 shadow-card transition-transform duration-200 md:static md:translate-x-0 md:shadow-none',
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-h5 text-primary">TechnoHouse Admin</h1>
                <button
                  type="button"
                  className="rounded-sm border border-border px-1 py-1 text-small md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    className={cn(
                      'dir-aware-row dir-aware-space rounded-md px-2 py-2 text-small font-medium transition-colors hover:bg-neutral-100',
                      item.key === activeKey ? 'bg-primary text-primary-foreground hover:bg-primary/95' : 'text-neutral-600 dark:text-neutral-500',
                    )}
                  >
                    {item.icon ? <span className="text-base">{item.icon}</span> : null}
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-3 py-2 backdrop-blur sm:px-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="dir-aware-row dir-aware-space">
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className="rounded-md border border-border px-2 py-1 text-small md:hidden"
                    >
                      ☰
                    </button>
                    <div>
                      <p className="text-small text-neutral-500">Admin Panel</p>
                      <h2 className="text-h6">{activeLabel}</h2>
                    </div>
                  </div>

                  <div className="dir-aware-row dir-aware-space">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>
              </header>

              <main className="page-transition flex-1 p-3 sm:p-4 lg:p-5">{children}</main>
            </div>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
