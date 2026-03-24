import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/layout';
import { SeoMeta } from '../../components/seo';
import { Card, CardContent, CardTitle } from '../../components/ui';

interface DashboardOverviewResponse {
  success: boolean;
  data: {
    totals: {
      properties: number;
      users: number;
      messages: number;
    };
    monthlyMessages: Array<{ month: string; total: number }>;
    propertiesByCity: Array<{ city: string; total: number }>;
  };
}

function MiniBars({ data }: { data: Array<{ label: string; value: number }> }) {
  const maxValue = useMemo(() => Math.max(...data.map((item) => item.value), 1), [data]);

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-secondary transition-all"
            style={{ height: `${Math.max((item.value / maxValue) * 100, 6)}%` }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-[11px] text-neutral-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutLike({ data }: { data: Array<{ label: string; value: number }> }) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const width = total > 0 ? (item.value / total) * 100 : 0;

        return (
          <div key={item.label}>
            <div className="mb-1 dir-aware-row items-center justify-between text-small">
              <span>{item.label}</span>
              <span className="text-neutral-500">{item.value}</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-200">
              <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardOverviewPage() {
  const [data, setData] = useState<DashboardOverviewResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOverview() {
      setIsLoading(true);

      try {
        const response = await fetch('/api/admin/dashboard/overview');
        const payload = (await response.json()) as DashboardOverviewResponse;

        if (isMounted && payload.success) {
          setData(payload.data);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    { label: 'Total Properties', value: data?.totals.properties ?? 0, icon: '🏘️' },
    { label: 'Users', value: data?.totals.users ?? 0, icon: '👥' },
    { label: 'Messages', value: data?.totals.messages ?? 0, icon: '💬' },
  ];

  return (
    <AdminLayout pageTitle="Dashboard Overview" activeKey="dashboard">
      <SeoMeta
        title="Admin Dashboard | TechnoHouse"
        description="Overview of platform performance including users, properties, and inquiries."
        canonicalPath="/admin"
      />
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} isLoading={isLoading}>
              <CardContent className="dir-aware-row items-center justify-between">
                <div>
                  <p className="text-small text-neutral-500">{stat.label}</p>
                  <p className="mt-1 text-h3 text-primary">{stat.value.toLocaleString()}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-3 xl:grid-cols-2">
          <Card isLoading={isLoading}>
            <CardTitle>Messages Trend (Last 6 Months)</CardTitle>
            <CardContent className="mt-3">
              <MiniBars
                data={(data?.monthlyMessages ?? []).map((item) => ({ label: item.month.split(' ')[0], value: item.total }))}
              />
            </CardContent>
          </Card>

          <Card isLoading={isLoading}>
            <CardTitle>Published Properties by City</CardTitle>
            <CardContent className="mt-3">
              <DonutLike
                data={(data?.propertiesByCity ?? []).map((item) => ({ label: item.city, value: item.total }))}
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
}
