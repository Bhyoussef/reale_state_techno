import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/layout';
import { Badge, Button, Card, Input, Modal, Select } from '../../components/ui';

interface AdminProperty {
  id: string;
  title: string;
  city: string;
  price: number;
  listingType: 'sale' | 'rent';
  status: 'draft' | 'published' | 'approved' | 'rejected';
  bedrooms: number;
  bathrooms: number;
}

type PropertyFormState = {
  title: string;
  city: string;
  price: string;
  listingType: 'sale' | 'rent';
  bedrooms: string;
  bathrooms: string;
  description: string;
};

const initialFormState: PropertyFormState = {
  title: '',
  city: '',
  price: '',
  listingType: 'sale',
  bedrooms: '',
  bathrooms: '',
  description: '',
};

function getStatusVariant(status: AdminProperty['status']): 'default' | 'success' | 'error' | 'accent' {
  if (status === 'approved' || status === 'published') return 'success';
  if (status === 'rejected') return 'error';
  return 'default';
}

export function ManagePropertiesPage() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormState>(initialFormState);
  const [images, setImages] = useState<File[]>([]);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  async function loadProperties() {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/properties');
      const payload = (await response.json()) as { success: boolean; data: AdminProperty[] };

      if (payload.success) {
        setProperties(payload.data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProperties();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm(initialFormState);
    setImages([]);
    setIsModalOpen(true);
  }

  function openEditModal(property: AdminProperty) {
    setEditingId(property.id);
    setForm({
      title: property.title,
      city: property.city,
      price: String(property.price),
      listingType: property.listingType,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      description: '',
    });
    setImages([]);
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('city', form.city);
    formData.append('price', form.price);
    formData.append('listingType', form.listingType);
    formData.append('bedrooms', form.bedrooms);
    formData.append('bathrooms', form.bathrooms);
    formData.append('description', form.description);
    images.forEach((file) => formData.append('images', file));

    try {
      const url = isEditing ? `/api/admin/properties/${editingId}` : '/api/admin/properties';
      const method = isEditing ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        body: formData,
      });

      await loadProperties();
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/properties/${id}`, { method: 'DELETE' });
    await loadProperties();
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await fetch(`/api/admin/properties/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    await loadProperties();
  }

  return (
    <AdminLayout pageTitle="Manage Properties" activeKey="properties">
      <div className="space-y-4">
        <div className="dir-aware-row items-center justify-between">
          <h1 className="text-h4">Property Management</h1>
          <Button onClick={openCreateModal}>+ Add Property</Button>
        </div>

        <Card isLoading={isLoading}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-small">
              <thead>
                <tr className="border-b border-border text-left text-neutral-500">
                  <th className="px-2 py-2">Property</th>
                  <th className="px-2 py-2">City</th>
                  <th className="px-2 py-2">Price</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-border/60">
                    <td className="px-2 py-2 font-medium">{property.title}</td>
                    <td className="px-2 py-2">{property.city}</td>
                    <td className="px-2 py-2">${property.price.toLocaleString()}</td>
                    <td className="px-2 py-2 capitalize">{property.listingType}</td>
                    <td className="px-2 py-2">
                      <Badge variant={getStatusVariant(property.status)}>{property.status}</Badge>
                    </td>
                    <td className="px-2 py-2">
                      <div className="dir-aware-row justify-end dir-aware-space">
                        <Button size="sm" variant="secondary" onClick={() => openEditModal(property)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(property.id, 'approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => updateStatus(property.id, 'rejected')}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleDelete(property.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        title={isEditing ? 'Edit Property' : 'Create Property'}
        onClose={() => setIsModalOpen(false)}
        isLoading={isSaving}
        footer={null}
      >
        <form className="space-y-2" onSubmit={handleSubmit}>
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <Input
            placeholder="City"
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            required
          />

          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              required
            />
            <Select
              value={form.listingType}
              onChange={(event) =>
                setForm((current) => ({ ...current, listingType: event.target.value as 'sale' | 'rent' }))
              }
              options={[
                { label: 'Sale', value: 'sale' },
                { label: 'Rent', value: 'rent' },
              ]}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              type="number"
              placeholder="Bedrooms"
              value={form.bedrooms}
              onChange={(event) => setForm((current) => ({ ...current, bedrooms: event.target.value }))}
              required
            />
            <Input
              type="number"
              placeholder="Bathrooms"
              value={form.bathrooms}
              onChange={(event) => setForm((current) => ({ ...current, bathrooms: event.target.value }))}
              required
            />
          </div>

          <textarea
            className="min-h-28 w-full rounded-md border border-border bg-input p-2 text-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />

          <div>
            <label className="mb-1 block text-small text-neutral-500">Property images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setImages(Array.from(event.target.files ?? []))
              }
              className="block w-full rounded-md border border-border bg-background p-2 text-small"
            />
            {images.length > 0 ? (
              <p className="mt-1 text-small text-neutral-500">{images.length} image(s) selected.</p>
            ) : null}
          </div>

          <div className="dir-aware-row justify-end dir-aware-space pt-1">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {isEditing ? 'Save Changes' : 'Create Property'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
