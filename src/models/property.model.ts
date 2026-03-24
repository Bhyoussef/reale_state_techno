export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'published' | 'sold' | 'rented';

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;
  listingType: ListingType;
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
  status: PropertyStatus;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
