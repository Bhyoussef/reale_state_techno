import { MouseEvent } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from '../../lib/cn';
import { optimizeImageUrl } from '../../lib/image';

export interface PropertyCardProps {
  id?: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  imageUrl?: string;
  isLoading?: boolean;
  disabled?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  beds,
  baths,
  area,
  imageUrl,
  isLoading = false,
  disabled = false,
  isFavorite = false,
  onToggleFavorite,
}: PropertyCardProps) {
  const isInactive = isLoading || disabled;

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (id && onToggleFavorite && !isInactive) {
      onToggleFavorite(id);
    }
  };

  return (
    <Card isLoading={isLoading} disabled={disabled} className="overflow-hidden p-0">
      {!isLoading ? (
        <>
          <div className="relative h-32 w-full overflow-hidden bg-neutral-100">
            {imageUrl ? (
              <img
                src={optimizeImageUrl(imageUrl, 1200, 72)}
                alt={title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
            )}
            <Badge variant="accent" className="absolute end-2 top-2">
              Featured
            </Badge>
            <button
              type="button"
              aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              onClick={handleFavoriteClick}
              className={cn(
                'absolute start-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm transition-transform hover:scale-105',
                isFavorite && 'heart-pop text-error',
                isInactive && 'pointer-events-none opacity-50',
              )}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <div className="p-3">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <Badge>{price}</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-small text-neutral-500">{location}</p>
              <div className="dir-aware-row dir-aware-space text-small text-neutral-600 dark:text-neutral-500">
                <span>{beds} Beds</span>
                <span>{baths} Baths</span>
                <span>{area}</span>
              </div>
            </CardContent>
            <div className="mt-3">
              <Button variant="primary" className="w-full" disabled={isInactive} isLoading={isLoading}>
                View Details
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}
