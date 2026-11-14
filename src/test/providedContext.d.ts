import type { RenderedPage } from '../app/pageHeads';

declare module 'vitest' {
  export interface ProvidedContext {
    /** Pre-rendered pages from tests/setup/renderPages.ts (D-068), by address. */
    prerenderedPages: Record<string, RenderedPage>;
  }
}
