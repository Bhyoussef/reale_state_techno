import { DatabaseClient } from '../properties';

export interface FavoriteItem {
  id: string;
  propertyId: string;
  createdAt: string;
  property: {
    title: string;
    slug: string;
    price: number;
    city: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    coverImageUrl?: string | null;
  };
}

export class FavoriteService {
  constructor(private readonly db: DatabaseClient) {}

  async addFavorite(userId: string, propertyId: string): Promise<void> {
    await this.db.query(
      `
      INSERT INTO favorites (user_id, property_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, property_id)
      DO UPDATE SET deleted_at = NULL, updated_at = NOW()
      `,
      [userId, propertyId],
    );
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    await this.db.query(
      `
      UPDATE favorites
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE user_id = $1
        AND property_id = $2
        AND deleted_at IS NULL
      `,
      [userId, propertyId],
    );
  }

  async listFavorites(userId: string): Promise<FavoriteItem[]> {
    const sql = `
      SELECT
        f.id,
        f.property_id AS "propertyId",
        f.created_at AS "createdAt",
        p.title,
        p.slug,
        p.price,
        p.city,
        p.bedrooms,
        p.bathrooms,
        p.area_sqft AS "areaSqft",
        cover.image_url AS "coverImageUrl"
      FROM favorites f
      INNER JOIN properties p
        ON p.id = f.property_id
      LEFT JOIN LATERAL (
        SELECT image_url
        FROM property_images
        WHERE property_id = p.id
          AND deleted_at IS NULL
        ORDER BY is_cover DESC, display_order ASC
        LIMIT 1
      ) AS cover ON TRUE
      WHERE f.user_id = $1
        AND f.deleted_at IS NULL
        AND p.deleted_at IS NULL
      ORDER BY f.created_at DESC
    `;

    const result = await this.db.query<{
      id: string;
      propertyId: string;
      createdAt: string;
      title: string;
      slug: string;
      price: number;
      city: string;
      bedrooms: number;
      bathrooms: number;
      areaSqft: number;
      coverImageUrl?: string | null;
    }>(sql, [userId]);

    return result.rows.map((row) => ({
      id: row.id,
      propertyId: row.propertyId,
      createdAt: row.createdAt,
      property: {
        title: row.title,
        slug: row.slug,
        price: row.price,
        city: row.city,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        areaSqft: row.areaSqft,
        coverImageUrl: row.coverImageUrl,
      },
    }));
  }
}
