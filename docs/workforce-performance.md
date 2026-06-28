# Workforce frontend performance

## P22 refactor

`App.tsx` previously contained the shell, route dispatch, page components and their analysis/service imports in one module. That made every route pay the cost of the whole workforce feature during initial load.

P22 moved the existing page implementation to `src/WorkforcePages.tsx`, added route entry modules under `src/pages/workforce/`, and centralized route metadata in `src/routes/workforceRoutes.tsx`. `App.tsx` now renders only navigation, the selected lazy route, a shared loading state and a route error boundary.

All workforce routes use `React.lazy` and `Suspense`. Navigation labels and visibility also come from the route registry, so route paths are no longer duplicated in the shell.

## Build result

Before P22, the single JavaScript bundle was about 543 KB and triggered Vite's 500 KB warning.

After P22:

- Initial JavaScript chunk: about 208 KB, 65 KB gzip.
- Lazy workforce implementation chunk: about 344 KB, 79 KB gzip.
- No JavaScript chunk exceeds 500 KB, so the Vite bundle warning is gone.

## Current simplification

The route entry files are independent lazy boundaries, while the existing page logic remains in one shared lazy implementation chunk. This preserves behavior and localStorage contracts during the first architecture split. A later pass can move each page's implementation and page-only analyzers into its route entry to produce finer-grained chunks.

## Next reduction opportunities

- Move page implementations out of `WorkforcePages.tsx` group by group.
- Dynamically import export/download utilities only when their buttons are used.
- Split print-only and archive-only code from interactive routes.
- Measure route-level loading with real production traffic before adding manual chunk rules.
