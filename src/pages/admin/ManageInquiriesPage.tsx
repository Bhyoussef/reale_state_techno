import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/layout';
import { Badge, Button, Card, Input, Select } from '../../components/ui';

interface InquiryItem {
  id: string;
  subject?: string | null;
  body: string;
  isRead: boolean;
  createdAt: string;
  property: {
    id: string;
    title: string;
    slug: string;
  } | null;
  sender: {
    id: string;
    fullName: string;
    email: string;
  };
  recipient: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface InquiryApiResponse {
  success: boolean;
  data: InquiryItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function ManageInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isReadFilter, setIsReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);

  const activeInquiry = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === activeInquiryId) ?? inquiries[0] ?? null,
    [activeInquiryId, inquiries],
  );

  async function loadInquiries() {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();

      if (isReadFilter === 'read') params.set('isRead', 'true');
      if (isReadFilter === 'unread') params.set('isRead', 'false');

      const response = await fetch(`/api/messages/admin?${params.toString()}`);
      const payload = (await response.json()) as InquiryApiResponse;

      if (payload.success) {
        setInquiries(payload.data);
        setActiveInquiryId((current) => current ?? payload.data[0]?.id ?? null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, [isReadFilter]);

  const filteredInquiries = useMemo(() => {
    if (!search.trim()) {
      return inquiries;
    }

    const query = search.toLowerCase();
    return inquiries.filter(
      (inquiry) =>
        (inquiry.subject ?? '').toLowerCase().includes(query) ||
        inquiry.sender.fullName.toLowerCase().includes(query) ||
        inquiry.sender.email.toLowerCase().includes(query) ||
        inquiry.body.toLowerCase().includes(query),
    );
  }, [inquiries, search]);

  async function markAsRead(id: string) {
    await fetch(`/api/messages/admin/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });

    setInquiries((current) =>
      current.map((inquiry) => (inquiry.id === id ? { ...inquiry, isRead: true } : inquiry)),
    );
  }

  return (
    <AdminLayout pageTitle="Manage Inquiries" activeKey="messages">
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
          <Input
            placeholder="Search inquiries by subject, sender, or message"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            value={isReadFilter}
            onChange={(event) => setIsReadFilter(event.target.value as 'all' | 'read' | 'unread')}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Unread', value: 'unread' },
              { label: 'Read', value: 'read' },
            ]}
          />
        </div>

        <div className="grid gap-3 xl:grid-cols-[360px_1fr]">
          <Card isLoading={isLoading} className="max-h-[70vh] overflow-y-auto p-0">
            {filteredInquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                type="button"
                onClick={() => setActiveInquiryId(inquiry.id)}
                className={`w-full border-b border-border px-3 py-2 text-left transition-colors hover:bg-neutral-100 ${
                  activeInquiry?.id === inquiry.id ? 'bg-neutral-100' : ''
                }`}
              >
                <div className="mb-1 dir-aware-row items-center justify-between">
                  <p className="truncate text-small font-medium">{inquiry.sender.fullName}</p>
                  <Badge variant={inquiry.isRead ? 'default' : 'accent'}>
                    {inquiry.isRead ? 'Read' : 'New'}
                  </Badge>
                </div>
                <p className="truncate text-small text-neutral-500">
                  {inquiry.subject ?? `Inquiry for ${inquiry.property?.title ?? 'Property'}`}
                </p>
              </button>
            ))}
          </Card>

          <Card isLoading={isLoading}>
            {activeInquiry ? (
              <div className="space-y-3">
                <div className="dir-aware-row items-start justify-between gap-2">
                  <div>
                    <h2 className="text-h5">{activeInquiry.subject ?? 'Property Inquiry'}</h2>
                    <p className="mt-1 text-small text-neutral-500">
                      From: {activeInquiry.sender.fullName} ({activeInquiry.sender.email})
                    </p>
                    <p className="text-small text-neutral-500">
                      {new Date(activeInquiry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!activeInquiry.isRead ? (
                    <Button size="sm" onClick={() => markAsRead(activeInquiry.id)}>
                      Mark as Read
                    </Button>
                  ) : null}
                </div>

                {activeInquiry.property ? (
                  <div className="rounded-md border border-border bg-neutral-50 p-2 text-small dark:bg-neutral-100">
                    Related property: {activeInquiry.property.title}
                  </div>
                ) : null}

                <div className="rounded-md border border-border bg-background p-3">
                  <p className="whitespace-pre-line text-body">{activeInquiry.body}</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-40 items-center justify-center text-small text-neutral-500">
                Select an inquiry to view details.
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
