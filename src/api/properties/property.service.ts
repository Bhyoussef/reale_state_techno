import { Property } from '../../models';
import { withCache } from '../cache';

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'sale' | 'rent';
  city?: string;
  bedrooms?: number;
  search?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'bedrooms_desc';
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PropertyListResponse {
  data: Property[];
  pagination: PaginationMeta;
}

export interface PropertyDetails {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  title: string;
  slug: string;
  description: string;
  listingType: 'sale' | 'rent';
  propertyType: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  city: string;
  district?: string | null;
  addressLine?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string | null;
    isCover: boolean;
    displayOrder: number;
  }>;
}

export interface DatabaseClient {
  query<T>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

function getSortSql(sort?: PropertyFilters['sort']): string {
  switch (sort) {
    case 'price_asc':
      return 'price ASC, created_at DESC';
    case 'price_desc':
      return 'price DESC, created_at DESC';
    case 'bedrooms_desc':
      return 'bedrooms DESC, bathrooms DESC, created_at DESC';
    case 'latest':
    default:
      return 'published_at DESC NULLS LAST, created_at DESC';
  }
}

export class PropertyService {
  constructor(private readonly db: DatabaseClient) {}

  async listProperties(filters: PropertyFilters): Promise<PropertyListResponse> {
    const page = Math.max(filters.page ?? DEFAULT_PAGE, 1);
    const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
    const cacheKey = `properties:list:${JSON.stringify({
      ...filters,
      page,
      pageSize,
    })}`;

    return withCache(cacheKey, 60, async () => {

      const whereParts: string[] = ["deleted_at IS NULL", "status = 'published'"];
      const params: unknown[] = [];

      if (filters.minPrice !== undefined) {
        params.push(filters.minPrice);
        whereParts.push(`price >= $${params.length}`);
      }

      if (filters.maxPrice !== undefined) {
        params.push(filters.maxPrice);
        whereParts.push(`price <= $${params.length}`);
      }

      if (filters.listingType) {
        params.push(filters.listingType);
        whereParts.push(`listing_type = $${params.length}`);
      }

      if (filters.city) {
        params.push(filters.city.toLowerCase());
        whereParts.push(`LOWER(city) = $${params.length}`);
      }

      if (filters.bedrooms !== undefined) {
        params.push(filters.bedrooms);
        whereParts.push(`bedrooms >= $${params.length}`);
      }

      if (filters.search) {
        params.push(`%${filters.search.toLowerCase()}%`);
        whereParts.push(
          `(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`,
        );
      }

      const whereClause = whereParts.join(' AND ');

      const countSql = `
      SELECT COUNT(*)::INT AS total
      FROM properties
      WHERE ${whereClause}
    `;

      const countResult = await this.db.query<{ total: number }>(countSql, params);
      const total = countResult.rows[0]?.total ?? 0;

      const offset = (page - 1) * pageSize;

      const listParams = [...params, pageSize, offset];
      const listSql = `
      SELECT
        id,
        owner_id AS "ownerId",
        title,
        slug,
        description,
        listing_type AS "listingType",
        property_type AS "propertyType",
        price,
        currency,
        bedrooms,
        bathrooms,
        area_sqft AS "areaSqft",
        city,
        district,
        address_line AS "addressLine",
        latitude,
        longitude,
        status,
        published_at AS "publishedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        deleted_at AS "deletedAt"
      FROM properties
      WHERE ${whereClause}
      ORDER BY ${getSortSql(filters.sort)}
      LIMIT $${listParams.length - 1}
      OFFSET $${listParams.length}
    `;

      const listResult = await this.db.query<Property>(listSql, listParams);

      return {
        data: listResult.rows,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(Math.ceil(total / pageSize), 1),
        },
      };
    });
  }

  async getPropertyBySlug(slug: string): Promise<PropertyDetails | null> {
    return withCache(`properties:details:${slug}`, 90, async () => {
      const detailsResult = await this.db.query<{
      id: string;
      ownerId: string;
      ownerName: string;
      ownerEmail: string;
      ownerPhone?: string | null;
      title: string;
      slug: string;
      description: string;
      listingType: 'sale' | 'rent';
      propertyType: string;
      price: number;
      currency: string;
      bedrooms: number;
      bathrooms: number;
      areaSqft: number;
      city: string;
      district?: string | null;
      addressLine?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    }>(
      `
      SELECT
        p.id,
        p.owner_id AS "ownerId",
        u.full_name AS "ownerName",
        u.email AS "ownerEmail",
        u.phone AS "ownerPhone",
        p.title,
        p.slug,
        p.description,
        p.listing_type AS "listingType",
        p.property_type AS "propertyType",
        p.price,
        p.currency,
        p.bedrooms,
        p.bathrooms,
        p.area_sqft AS "areaSqft",
        p.city,
        p.district,
        p.address_line AS "addressLine",
        p.latitude,
        p.longitude
      FROM properties p
      INNER JOIN users u
        ON u.id = p.owner_id
      WHERE p.slug = $1
        AND p.deleted_at IS NULL
        AND p.status = 'published'
      LIMIT 1
      `,
      [slug],
    );

      const property = detailsResult.rows[0];

      if (!property) {
        return null;
      }

      const imagesResult = await this.db.query<{
      id: string;
      imageUrl: string;
      altText?: string | null;
      isCover: boolean;
      displayOrder: number;
    }>(
      `
      SELECT
        id,
        image_url AS "imageUrl",
        alt_text AS "altText",
        is_cover AS "isCover",
        display_order AS "displayOrder"
      FROM property_images
      WHERE property_id = $1
        AND deleted_at IS NULL
      ORDER BY is_cover DESC, display_order ASC
      `,
      [property.id],
    );

      return {
        ...property,
        images: imagesResult.rows,
      };
    });
  }

  async listSimilarProperties(slug: string, limit = 3): Promise<Property[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 12);
    return withCache(`properties:similar:${slug}:${safeLimit}`, 60, async () => {
      const result = await this.db.query<Property>(
      `
      SELECT
        p.id,
        p.owner_id AS "ownerId",
        p.title,
        p.slug,
        p.description,
        p.listing_type AS "listingType",
        p.property_type AS "propertyType",
        p.price,
        p.currency,
        p.bedrooms,
        p.bathrooms,
        p.area_sqft AS "areaSqft",
        p.city,
        p.district,
        p.address_line AS "addressLine",
        p.latitude,
        p.longitude,
        p.status,
        p.published_at AS "publishedAt",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.deleted_at AS "deletedAt"
      FROM properties p
      INNER JOIN properties source
        ON source.slug = $1
        AND source.deleted_at IS NULL
      WHERE p.id <> source.id
        AND p.deleted_at IS NULL
        AND p.status = 'published'
        AND p.city = source.city
      ORDER BY ABS(p.price - source.price), p.published_at DESC NULLS LAST
      LIMIT $2
      `,
        [slug, safeLimit],
      );

      return result.rows;
    });
  }

  async listFeaturedProperties(limit = 6): Promise<Property[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 24);
    return withCache(`properties:featured:${safeLimit}`, 90, async () => {
      const sql = `
      SELECT
        p.id,
        p.owner_id AS "ownerId",
        p.title,
        p.slug,
        p.description,
        p.listing_type AS "listingType",
        p.property_type AS "propertyType",
        p.price,
        p.currency,
        p.bedrooms,
        p.bathrooms,
        p.area_sqft AS "areaSqft",
        p.city,
        p.district,
        p.address_line AS "addressLine",
        p.latitude,
        p.longitude,
        p.status,
        p.published_at AS "publishedAt",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        p.deleted_at AS "deletedAt"
      FROM properties p
      LEFT JOIN property_images pi
        ON pi.property_id = p.id
        AND pi.is_cover = TRUE
        AND pi.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
        AND p.status = 'published'
      ORDER BY
        pi.is_cover DESC,
        p.published_at DESC NULLS LAST,
        p.price DESC
      LIMIT $1
    `;

      const result = await this.db.query<Property>(sql, [safeLimit]);
      return result.rows;
    });
  }
}
