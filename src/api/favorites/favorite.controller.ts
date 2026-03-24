import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware';
import { FavoriteService } from './favorite.service';

export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  addFavorite = async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    await this.favoriteService.addFavorite(req.user.id, propertyId);

    return res.status(201).json({
      success: true,
      message: 'Property added to favorites.',
    });
  };

  removeFavorite = async (req: AuthenticatedRequest, res: Response) => {
    const propertyId = req.params.propertyId;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    await this.favoriteService.removeFavorite(req.user.id, propertyId);

    return res.status(200).json({
      success: true,
      message: 'Property removed from favorites.',
    });
  };

  listFavorites = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const data = await this.favoriteService.listFavorites(req.user.id);

    return res.status(200).json({
      success: true,
      data,
    });
  };
}
