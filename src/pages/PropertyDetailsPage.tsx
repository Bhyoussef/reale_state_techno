import { FormEvent, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { MainLayout } from '../components/layout';
import { SeoMeta } from '../components/seo';
import { Badge, Button, Card, CardContent, CardTitle, Input, PropertyCard } from '../components/ui';
import { useFavorites } from '../hooks/useFavorites';

interface PropertyDetailsResponse {
  success: boolean;
  data: {
    id: string;
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone?: string;
    title: string;
    slug: string;
    description: string;
    propertyType: string;
    listingType: 'sale' | 'rent';
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    city: string;
    district?: string;
    addressLine?: string;
    latitude?: number;
    longitude?: number;
    images: Array<{
      id: string;
      imageUrl: string;
      altText?: string;
    }>;
  };
}

interface SimilarPropertiesResponse {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
  }>;
}

interface PropertyDetailsPageProps {
  slug: string;
}

export function PropertyDetailsPage({ slug }: PropertyDetailsPageProps) {
  const [details, setDetails] = useState<PropertyDetailsResponse['data'] | null>(null);
  const { favoritePropertyIds, toggleFavorite } = useFavorites();
  const [similarProperties, setSimilarProperties] = useState<SimilarPropertiesResponse['data']>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('I am interested in this property. Please contact me with more details.');

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setIsLoading(true);

      try {
        const [detailsResponse, similarResponse] = await Promise.all([
          fetch(`/api/properties/${slug}`),
          fetch(`/api/properties/${slug}/similar?limit=3`),
        ]);

        const detailsPayload = (await detailsResponse.json()) as PropertyDetailsResponse;
        const similarPayload = (await similarResponse.json()) as SimilarPropertiesResponse;

        if (!ignore && detailsPayload.success) {
          setDetails(detailsPayload.data);
          setSimilarProperties(similarPayload.success ? similarPayload.data : []);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [slug]);

  const primaryImage = useMemo(() => {
    if (!details?.images?.length) {
      return null;
    }

    return details.images[activeImage] ?? details.images[0];
  }, [activeImage, details?.images]);

  async function handleSubmitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!details) {
      return;
    }

    setIsSending(true);

    try {
      await fetch('/api/messages/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: details.id,
          subject: `Inquiry: ${details.title}`,
          body: `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
        }),
      });

      setMessage('Thanks! I am still interested. Please contact me.');
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading || !details) {
    return (
      <MainLayout>
      <SeoMeta
        title={`${details.title} | TechnoHouse`}
        description={details.description.slice(0, 155)}
        canonicalPath={`/properties/${details.slug}`}
      />
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <Card isLoading className="min-h-80" />
          <Card isLoading className="min-h-80" />
        </div>
      </MainLayout>
    );
  }

  const mapPosition: [number, number] = [details.latitude ?? 25.2048, details.longitude ?? 55.2708];

  return (
    <MainLayout>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_360px]">
        <section className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="relative h-72 w-full bg-neutral-100 sm:h-96">
              {primaryImage ? (
                <img
                  src={primaryImage.imageUrl}
                  alt={primaryImage.altText ?? details.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-400">No image available</div>
              )}
              <Badge variant="accent" className="absolute start-2 top-2">
                {details.listingType === 'sale' ? 'For Sale' : 'For Rent'}
              </Badge>
              <button
                type="button"
                aria-label={favoritePropertyIds.has(details.id) ? 'Remove from favorites' : 'Save to favorites'}
                onClick={() => toggleFavorite(details.id)}
                className={`absolute end-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm transition-transform hover:scale-105 ${favoritePropertyIds.has(details.id) ? 'heart-pop text-error' : 'text-primary'}`}
              >
                {favoritePropertyIds.has(details.id) ? '❤️' : '🤍'}
              </button>
            </div>

            {details.images.length > 1 ? (
              <div className="grid grid-cols-4 gap-1 p-1 sm:grid-cols-6">
                {details.images.map((image, index) => (
                  <button
                    key={image.id}
                    className={`overflow-hidden rounded-sm border ${
                      index === activeImage ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(index)}
                    type="button"
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText ?? details.title}
                      className="h-16 w-full object-cover sm:h-20"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </Card>

          <Card>
            <CardTitle>{details.title}</CardTitle>
            <CardContent className="mt-2">
              <div className="mb-2 dir-aware-row dir-aware-space text-small text-neutral-500">
                <span>{details.city}</span>
                {details.district ? <span>{details.district}</span> : null}
              </div>

              <div className="mb-3 dir-aware-row dir-aware-space text-small text-neutral-600 dark:text-neutral-500">
                <span>{details.bedrooms} Beds</span>
                <span>{details.bathrooms} Baths</span>
                <span>{details.areaSqft.toLocaleString()} sqft</span>
                <span className="capitalize">{details.propertyType}</span>
              </div>

              <p>{details.description}</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="h-[320px] w-full">
              <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapPosition}>
                  <Popup>{details.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>

          <section>
            <div className="mb-3 dir-aware-row items-center justify-between">
              <h2 className="text-h4">Similar Properties</h2>
              <Button variant="secondary" size="sm">
                View More
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {similarProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  title={property.title}
                  location={property.city}
                  price={`$${property.price.toLocaleString()}`}
                  beds={property.bedrooms}
                  baths={property.bathrooms}
                  area={`${property.areaSqft.toLocaleString()} sqft`}
                />
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
          <Card className="p-3">
            <p className="text-small uppercase tracking-wide text-neutral-500">Price</p>
            <p className="mt-1 text-h3 text-primary">
              {details.currency} {details.price.toLocaleString()}
            </p>
            <p className="mt-1 text-small text-neutral-500">Listed by {details.ownerName}</p>
            <Button className="mt-3 w-full" size="lg">
              Call Agent
            </Button>
          </Card>

          <Card>
            <CardTitle>Contact Agent</CardTitle>
            <CardContent className="mt-2">
              <form className="space-y-2" onSubmit={handleSubmitInquiry}>
                <Input placeholder="Your name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                <Input placeholder="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
                <textarea
                  className="min-h-28 w-full rounded-md border border-border bg-input p-2 text-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <Button className="w-full" size="lg" isLoading={isSending}>
                  Send Inquiry
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </MainLayout>
  );
}
