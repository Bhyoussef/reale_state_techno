import { MainLayout } from '../components/layout';
import { SeoMeta } from '../components/seo';
import { Badge, Button, Card, CardContent, CardTitle, Input, PropertyCard, Select } from '../components/ui';

export interface HomePageProperty {
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  area: string;
  imageUrl?: string;
}

export interface HomePageProps {
  featuredProperties?: HomePageProperty[];
  isLoading?: boolean;
}

const defaultFeaturedProperties: HomePageProperty[] = [
  {
    title: 'Palm Waterfront Signature Villa',
    location: 'Palm Jumeirah, Dubai',
    price: '$4,950,000',
    beds: 6,
    baths: 7,
    area: '7,800 sqft',
    imageUrl: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f',
  },
  {
    title: 'Skyline Penthouse with Private Terrace',
    location: 'Downtown Dubai, Dubai',
    price: '$2,780,000',
    beds: 4,
    baths: 4,
    area: '4,100 sqft',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
  },
  {
    title: 'Elegant Family Home in Green Community',
    location: 'Arabian Ranches, Dubai',
    price: '$1,430,000',
    beds: 4,
    baths: 5,
    area: '3,350 sqft',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  },
];

const categories = [
  { title: 'Luxury Villas', count: '125+ listings', icon: '🏡' },
  { title: 'Apartments', count: '430+ listings', icon: '🏙️' },
  { title: 'Townhouses', count: '210+ listings', icon: '🏘️' },
  { title: 'Commercial', count: '95+ listings', icon: '🏢' },
];

export function HomePage({
  featuredProperties = defaultFeaturedProperties,
  isLoading = false,
}: HomePageProps) {
  return (
    <MainLayout>
      <SeoMeta
        title="TechnoHouse | Premium Real Estate Marketplace"
        description="Discover premium properties for sale and rent with verified listings and trusted agents."
        canonicalPath="/"
      />
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-primary via-neutral-800 to-primary px-3 py-6 text-primary-foreground sm:px-4 sm:py-8">
          <div className="relative z-10 max-w-3xl">
            <Badge variant="accent" className="mb-2">
              Premium Properties
            </Badge>
            <h1 className="text-h2 sm:text-h1">Find Your Next Home with Confidence</h1>
            <p className="mt-2 max-w-2xl text-body text-neutral-200">
              Explore curated listings with transparent pricing, trusted agents, and neighborhood
              insights designed to help you move faster.
            </p>

            <div className="mt-4 rounded-lg border border-white/20 bg-background/95 p-2 shadow-card">
              <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Input placeholder="Search by area, tower, or keyword" isLoading={isLoading} />
                <Select
                  options={[
                    { label: 'Buy', value: 'sale' },
                    { label: 'Rent', value: 'rent' },
                  ]}
                  placeholder="Type"
                  isLoading={isLoading}
                />
                <Select
                  options={[
                    { label: 'Dubai', value: 'dubai' },
                    { label: 'Abu Dhabi', value: 'abu-dhabi' },
                    { label: 'Sharjah', value: 'sharjah' },
                  ]}
                  placeholder="City"
                  isLoading={isLoading}
                />
                <Button className="w-full" isLoading={isLoading}>
                  Search Properties
                </Button>
              </form>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=60')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-hidden="true"
          />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-h4">Featured Properties</h2>
            <Button variant="secondary" size="sm">
              View All
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProperties.map((property) => (
              <PropertyCard key={`${property.title}-${property.location}`} {...property} isLoading={isLoading} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-h4">Browse by Category</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.title} className="p-3">
                <CardTitle className="dir-aware-row dir-aware-space text-h6">
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </CardTitle>
                <CardContent className="mt-1 text-small">{category.count}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-primary px-3 py-5 text-primary-foreground sm:px-4">
          <div className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-h4">List Your Property with TechnoHouse</h3>
              <p className="mt-1 max-w-2xl text-body text-neutral-200">
                Reach qualified buyers and tenants through a premium marketplace built for serious
                real-estate transactions.
              </p>
            </div>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-neutral-100">
              Start Listing
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
