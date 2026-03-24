import { useCallback, useEffect, useMemo, useState } from 'react';

interface FavoriteApiItem {
  id: string;
  propertyId: string;
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

interface FavoritesResponse {
  success: boolean;
  data: FavoriteApiItem[];
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const favoritePropertyIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.propertyId)),
    [favorites],
  );

  const refreshFavorites = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/favorites');
      const payload = (await response.json()) as FavoritesResponse;

      if (payload.success) {
        setFavorites(payload.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      const isAlreadyFavorite = favoritePropertyIds.has(propertyId);

      await fetch(`/api/favorites/${propertyId}`, {
        method: isAlreadyFavorite ? 'DELETE' : 'POST',
      });

      await refreshFavorites();
    },
    [favoritePropertyIds, refreshFavorites],
  );

  return {
    favorites,
    favoritePropertyIds,
    toggleFavorite,
    refreshFavorites,
    isLoading,
  };
}
