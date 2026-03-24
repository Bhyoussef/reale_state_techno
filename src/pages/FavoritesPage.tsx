import { MainLayout } from '../components/layout';
import { SeoMeta } from '../components/seo';
import { Button, Card, PropertyCard, Skeleton } from '../components/ui';
import { useFavorites } from '../hooks/useFavorites';

export function FavoritesPage() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  return (
    <MainLayout>
      <SeoMeta
        title="Saved Properties | TechnoHouse"
        description="Review and manage your favorite properties in one place."
        canonicalPath="/favorites"
      />
      <section>
        <div className="mb-3 dir-aware-row items-center justify-between">
          <h1 className="text-h3">Saved Properties</h1>
          <Button variant="secondary" size="sm">
            Browse More
          </Button>
        </div>

        {favorites.length === 0 && !isLoading ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <h2 className="text-h5">No saved properties yet</h2>
            <p className="mt-1 text-small text-neutral-500">
              Tap the heart icon on any property to save it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(isLoading ? Array.from({ length: 6 }) : favorites).map((item, index) => {
              if (isLoading) {
                return (
                  <Card key={`skeleton-${index}`} className="overflow-hidden p-0">
                    <Skeleton className="h-32 w-full rounded-none" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                );
              }

              return (
                <PropertyCard
                  key={item.id}
                  id={item.propertyId}
                  title={item.property.title}
                  location={item.property.city}
                  price={`$${item.property.price.toLocaleString()}`}
                  beds={item.property.bedrooms}
                  baths={item.property.bathrooms}
                  area={`${item.property.areaSqft.toLocaleString()} sqft`}
                  imageUrl={item.property.coverImageUrl ?? undefined}
                  isFavorite
                  onToggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
