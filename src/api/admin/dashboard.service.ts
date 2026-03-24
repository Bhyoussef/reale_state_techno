import { DatabaseClient } from '../properties';
import { withCache } from '../cache';

export interface DashboardOverview {
  totals: {
    properties: number;
    users: number;
    messages: number;
  };
  monthlyMessages: Array<{ month: string; total: number }>;
  propertiesByCity: Array<{ city: string; total: number }>;
}

export class DashboardService {
  constructor(private readonly db: DatabaseClient) {}

  async getOverview(): Promise<DashboardOverview> {
    return withCache('admin:dashboard:overview', 60, async () => {
      const [propertiesResult, usersResult, messagesResult, monthlyMessagesResult, cityDistributionResult] =
        await Promise.all([
          this.db.query<{ total: number }>(
            `SELECT COUNT(*)::INT AS total FROM properties WHERE deleted_at IS NULL`,
          ),
          this.db.query<{ total: number }>(
            `SELECT COUNT(*)::INT AS total FROM users WHERE deleted_at IS NULL`,
          ),
          this.db.query<{ total: number }>(
            `SELECT COUNT(*)::INT AS total FROM messages WHERE deleted_at IS NULL`,
          ),
          this.db.query<{ month: string; total: number }>(
            `
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
            COUNT(*)::INT AS total
          FROM messages
          WHERE deleted_at IS NULL
            AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY DATE_TRUNC('month', created_at)
          `,
          ),
          this.db.query<{ city: string; total: number }>(
            `
          SELECT city, COUNT(*)::INT AS total
          FROM properties
          WHERE deleted_at IS NULL
            AND status = 'published'
          GROUP BY city
          ORDER BY total DESC
          LIMIT 6
          `,
          ),
        ]);

      return {
        totals: {
          properties: propertiesResult.rows[0]?.total ?? 0,
          users: usersResult.rows[0]?.total ?? 0,
          messages: messagesResult.rows[0]?.total ?? 0,
        },
        monthlyMessages: monthlyMessagesResult.rows,
        propertiesByCity: cityDistributionResult.rows,
      };
    });
  }
}
