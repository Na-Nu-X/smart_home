import { Pipe, PipeTransform } from '@angular/core';

import { formatEur, formatNumber, resizeImage } from '../../core/utils/format';

/** `{{ 3900 | eur }}` -> "3 900 €" */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    return formatEur(value);
  }
}

/** `{{ 1450 | num }}` -> "1 450" */
@Pipe({ name: 'num' })
export class NumPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : formatNumber(value);
  }
}

/** `[src]="url | img: 800"` – requests a resized Unsplash rendition. */
@Pipe({ name: 'img' })
export class ImgPipe implements PipeTransform {
  transform(url: string | null | undefined, width = 1200): string {
    return url ? resizeImage(url, width) : '';
  }
}
