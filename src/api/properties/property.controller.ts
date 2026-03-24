import { Request, Response } from 'express';
import { PropertyFilters, PropertyService } from './property.service';

function parseNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSort(value: unknown): PropertyFilters['sort'] {
  const allowedSorts: PropertyFilters['sort'][] = ['latest', 'price_asc', 'price_desc', 'bedrooms_desc'];
  if (typeof value === 'string' && allowedSorts.includes(value as PropertyFilters['sort'])) {
    return value as PropertyFilters['sort'];
  }

  return 'latest';
}

export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  listProperties = async (req: Request, res: Response) => {
    const filters: PropertyFilters = {
      minPrice: parseNumber(req.query.minPrice),
      maxPrice: parseNumber(req.query.maxPrice),
      listingType: req.query.type === 'sale' || req.query.type === 'rent' ? req.query.type : undefined,
      city: typeof req.query.city === 'string' ? req.query.city : undefined,
      bedrooms: parseNumber(req.query.bedrooms),
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      sort: parseSort(req.query.sort),
      page: parseNumber(req.query.page),
      pageSize: parseNumber(req.query.pageSize),
    };

    const result = await this.propertyService.listProperties(filters);

    return res.status(200).json({
      success: true,
      ...result,
    });
  };

  getPropertyDetails = async (req: Request, res: Response) => {
    const { slug } = req.params;

    const data = await this.propertyService.getPropertyBySlug(slug);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  };

  listSimilarProperties = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const limit = parseNumber(req.query.limit) ?? 3;

    const data = await this.propertyService.listSimilarProperties(slug, limit);

    return res.status(200).json({
      success: true,
      data,
    });
  };

  listFeaturedProperties = async (req: Request, res: Response) => {
    const limit = parseNumber(req.query.limit);
    const data = await this.propertyService.listFeaturedProperties(limit);

    return res.status(200).json({
      success: true,
      data,
    });
  };
}
