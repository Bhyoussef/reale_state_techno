import { DatabaseClient } from '../properties';

export interface SendInquiryPayload {
  propertyId: string;
  senderId: string;
  subject?: string;
  body: string;
}

export interface AdminMessageFilter {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}

export interface AdminMessagesResponse {
  data: Array<{
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
  }>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class MessageService {
  constructor(private readonly db: DatabaseClient) {}

  async sendInquiry(payload: SendInquiryPayload): Promise<{ id: string }> {
    const ownerResult = await this.db.query<{ ownerId: string }>(
      `
      SELECT owner_id AS "ownerId"
      FROM properties
      WHERE id = $1
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [payload.propertyId],
    );

    const ownerId = ownerResult.rows[0]?.ownerId;

    if (!ownerId) {
      throw new Error('Property not found.');
    }

    if (ownerId === payload.senderId) {
      throw new Error('Cannot send inquiry to yourself.');
    }

    const result = await this.db.query<{ id: string }>(
      `
      INSERT INTO messages (property_id, sender_id, recipient_id, subject, body)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [payload.propertyId, payload.senderId, ownerId, payload.subject ?? null, payload.body],
    );

    return result.rows[0];
  }

  async listAdminMessages(filter: AdminMessageFilter): Promise<AdminMessagesResponse> {
    const page = Math.max(filter.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.min(Math.max(filter.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);

    const whereParts: string[] = ['m.deleted_at IS NULL'];
    const params: unknown[] = [];

    if (filter.isRead !== undefined) {
      params.push(filter.isRead);
      whereParts.push(`m.is_read = $${params.length}`);
    }

    const whereClause = whereParts.join(' AND ');

    const countResult = await this.db.query<{ total: number }>(
      `
      SELECT COUNT(*)::INT AS total
      FROM messages m
      WHERE ${whereClause}
      `,
      params,
    );

    const total = countResult.rows[0]?.total ?? 0;
    const offset = (page - 1) * pageSize;

    const listParams = [...params, pageSize, offset];
    const dataResult = await this.db.query<{
      id: string;
      subject?: string | null;
      body: string;
      isRead: boolean;
      createdAt: string;
      propertyId?: string | null;
      propertyTitle?: string | null;
      propertySlug?: string | null;
      senderId: string;
      senderName: string;
      senderEmail: string;
      recipientId: string;
      recipientName: string;
      recipientEmail: string;
    }>(
      `
      SELECT
        m.id,
        m.subject,
        m.body,
        m.is_read AS "isRead",
        m.created_at AS "createdAt",
        p.id AS "propertyId",
        p.title AS "propertyTitle",
        p.slug AS "propertySlug",
        su.id AS "senderId",
        su.full_name AS "senderName",
        su.email AS "senderEmail",
        ru.id AS "recipientId",
        ru.full_name AS "recipientName",
        ru.email AS "recipientEmail"
      FROM messages m
      LEFT JOIN properties p ON p.id = m.property_id
      INNER JOIN users su ON su.id = m.sender_id
      INNER JOIN users ru ON ru.id = m.recipient_id
      WHERE ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${listParams.length - 1}
      OFFSET $${listParams.length}
      `,
      listParams,
    );

    return {
      data: dataResult.rows.map((row) => ({
        id: row.id,
        subject: row.subject,
        body: row.body,
        isRead: row.isRead,
        createdAt: row.createdAt,
        property: row.propertyId
          ? {
              id: row.propertyId,
              title: row.propertyTitle ?? '',
              slug: row.propertySlug ?? '',
            }
          : null,
        sender: {
          id: row.senderId,
          fullName: row.senderName,
          email: row.senderEmail,
        },
        recipient: {
          id: row.recipientId,
          fullName: row.recipientName,
          email: row.recipientEmail,
        },
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
      },
    };
  }


  async markAsRead(messageId: string, isRead: boolean): Promise<void> {
    await this.db.query(
      `
      UPDATE messages
      SET is_read = $2, updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      `,
      [messageId, isRead],
    );
  }
}
