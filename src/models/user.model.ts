export type UserRole = 'admin' | 'agent' | 'user';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
