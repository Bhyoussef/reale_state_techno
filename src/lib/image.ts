export function optimizeImageUrl(url: string, width = 900, quality = 70): string {
  if (!url) {
    return url;
  }

  const supportsUnsplashOptimization =
    url.includes('images.unsplash.com') || url.includes('source.unsplash.com');

  if (!supportsUnsplashOptimization) {
    return url;
  }

  const hasQuery = url.includes('?');
  const separator = hasQuery ? '&' : '?';

  return `${url}${separator}auto=format&fit=crop&w=${width}&q=${quality}`;
}
