import { useEffect } from 'react';

export interface SeoMetaProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

function upsertMetaTag(name: 'description' | 'og:title' | 'og:description', content: string, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    if (isProperty) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

export function SeoMeta({ title, description, canonicalPath }: SeoMetaProps) {
  useEffect(() => {
    document.title = title;
    upsertMetaTag('description', description);
    upsertMetaTag('og:title', title, true);
    upsertMetaTag('og:description', description, true);

    if (canonicalPath) {
      let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }

      canonicalLink.setAttribute('href', canonicalPath);
    }
  }, [canonicalPath, description, title]);

  return null;
}
