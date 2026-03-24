import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/layout';
import { Badge, Button, Card, Select } from '../../components/ui';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  isVerified: boolean;
  createdAt: string;
}

function roleBadgeVariant(role: AdminUser['role']): 'default' | 'success' | 'error' | 'accent' {
  if (role === 'admin') return 'accent';
  if (role === 'agent') return 'success';
  return 'default';
}

export function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function loadUsers() {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/users');
      const payload = (await response.json()) as { success: boolean; data: AdminUser[] };

      if (payload.success) {
        setUsers(payload.data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateRole(userId: string, role: AdminUser['role']) {
    setUpdatingUserId(userId);

    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      await loadUsers();
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function deleteUser(userId: string) {
    setUpdatingUserId(userId);

    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      await loadUsers();
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <AdminLayout pageTitle="Manage Users" activeKey="users">
      <div className="space-y-4">
        <div className="dir-aware-row items-center justify-between">
          <h1 className="text-h4">User Management</h1>
          <p className="text-small text-neutral-500">Total users: {users.length}</p>
        </div>

        <Card isLoading={isLoading}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-small">
              <thead>
                <tr className="border-b border-border text-left text-neutral-500">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Verified</th>
                  <th className="px-2 py-2">Created</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/60">
                    <td className="px-2 py-2 font-medium">{user.fullName}</td>
                    <td className="px-2 py-2 text-neutral-600 dark:text-neutral-500">{user.email}</td>
                    <td className="px-2 py-2">
                      <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-2 py-2">{user.isVerified ? 'Yes' : 'No'}</td>
                    <td className="px-2 py-2">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-2 py-2">
                      <div className="dir-aware-row justify-end dir-aware-space">
                        <Select
                          className="min-w-[150px]"
                          value={user.role}
                          onChange={(event) => updateRole(user.id, event.target.value as AdminUser['role'])}
                          disabled={updatingUserId === user.id}
                          options={[
                            { label: 'Admin', value: 'admin' },
                            { label: 'Agent', value: 'agent' },
                            { label: 'User', value: 'user' },
                          ]}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={updatingUserId === user.id}
                          onClick={() => deleteUser(user.id)}
                        >
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
    </AdminLayout>
  );
}
