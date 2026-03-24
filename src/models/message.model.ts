export interface Message {
  id: string;
  propertyId?: string | null;
  senderId: string;
  recipientId: string;
  subject?: string | null;
  body: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
