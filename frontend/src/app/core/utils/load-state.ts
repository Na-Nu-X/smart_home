import { Observable, catchError, map, of, startWith } from 'rxjs';

/** Discriminated union describing an async request lifecycle for templates. */
export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; notFound: boolean };

/** Wraps an observable into a `LoadState` stream (starts with `loading`). */
export function toLoadState<T>(source: Observable<T>): Observable<LoadState<T>> {
  return source.pipe(
    map((data): LoadState<T> => ({ status: 'success', data })),
    catchError((error: unknown) =>
      of<LoadState<T>>({
        status: 'error',
        notFound: typeof error === 'object' && error !== null && 'status' in error && error.status === 404,
      }),
    ),
    startWith<LoadState<T>>({ status: 'loading' }),
  );
}
