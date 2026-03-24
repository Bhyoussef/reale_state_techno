import { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '../components/layout';
import { SeoMeta } from '../components/seo';
import { Button, Card, Input, PropertyCard, Select, Skeleton } from '../components/ui';
import { useFavorites } from '../hooks/useFavorites';

interface PropertyListItem {
  id: string;
  title: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
}

interface PropertiesApiResponse {
  success: boolean;
  data: PropertyListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

type SortValue = 'latest' | 'price_asc' | 'price_desc' | 'bedrooms_desc';

const initialPagination = {
  page: 1,
  pageSize: 9,
  total: 0,
  totalPages: 1,
};

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

export function PropertiesPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [sort, setSort] = useState<SortValue>('latest');

  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const { favoritePropertyIds, toggleFavorite } = useFavorites();
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);

    params.set('sort', sort);
    params.set('page', String(page));
    params.set('pageSize', String(initialPagination.pageSize));

    return params.toString();
  }, [bedrooms, city, maxPrice, minPrice, page, search, sort, type]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/properties?${queryString}`, {
          method: 'GET',
          signal: controller.signal,
        });

        const payload = (await response.json()) as PropertiesApiResponse;

        if (payload.success) {
          setProperties(payload.data);
          setPagination(payload.pagination);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [queryString]);

  useEffect(() => {
    setPage(1);
  }, [search, city, type, minPrice, maxPrice, bedrooms, sort]);

  return (
    <MainLayout>
      <SeoMeta
        title="Properties | TechnoHouse"
        description="Browse and filter available properties with real-time search, sorting, and saved favorites."
        canonicalPath="/properties"
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-lg border border-border bg-background p-3 shadow-sm">
          <h2 className="mb-2 text-h5">Filters</h2>

          <div className="space-y-2">
            <Input
              placeholder="Search properties"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <Select
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="Listing type"
              options={[
                { label: 'Buy', value: 'sale' },
                { label: 'Rent', value: 'rent' },
              ]}
            />

            <Select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              options={[
                { label: 'Dubai', value: 'dubai' },
                { label: 'Abu Dhabi', value: 'abu-dhabi' },
                { label: 'Sharjah', value: 'sharjah' },
              ]}
            />

            <Input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />
            <Input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
            <Input
              type="number"
              placeholder="Bedrooms"
              value={bedrooms}
              onChange={(event) => setBedrooms(event.target.value)}
            />

            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setCity('');
                setType('');
                setMinPrice('');
                setMaxPrice('');
                setBedrooms('');
                setSort('latest');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </aside>

        <section>
          <div className="mb-3 dir-aware-row items-center justify-between">
            <p className="text-small text-neutral-500">
              Showing {properties.length} of {pagination.total} properties
            </p>

            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortValue)}
              placeholder="Sort by"
              options={[
                { label: 'Newest', value: 'latest' },
                { label: 'Price: Low to High', value: 'price_asc' },
                { label: 'Price: High to Low', value: 'price_desc' },
                { label: 'Most Bedrooms', value: 'bedrooms_desc' },
              ]}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <PropertyCardSkeleton key={index} />)
              : properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    location={property.city}
                    price={`$${property.price.toLocaleString()}`}
                    beds={property.bedrooms}
                    baths={property.bathrooms}
                    area={`${property.areaSqft.toLocaleString()} sqft`}
                    isFavorite={favoritePropertyIds.has(property.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
          </div>

          <div className="mt-4 dir-aware-row items-center justify-between rounded-lg border border-border bg-background p-2">
            <Button variant="secondary" disabled={page <= 1 || isLoading} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <p className="text-small text-neutral-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <Button
              variant="secondary"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
