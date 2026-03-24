export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  altText?: string | null;
  displayOrder: number;
  isCover: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
