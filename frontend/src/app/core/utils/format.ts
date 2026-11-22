const eurFormatter = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 0 });

export function formatEur(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const num = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(num) ? eurFormatter.format(num) : '';
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Resizes an Unsplash image URL (no-op for other hosts). */
export function resizeImage(url: string, width: number): string {
  if (!url || !url.includes('images.unsplash.com')) {
    return url;
  }
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    if (!parsed.searchParams.has('q')) {
      parsed.searchParams.set('q', '80');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
