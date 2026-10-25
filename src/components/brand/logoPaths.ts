/**
 * The CloudPrep logo (D-050): a cloud with circuit traces and three solid nodes, drawn on a
 * 48-unit grid. LogoMark draws them; scripts/generate-brand-assets.mjs and public/favicon.svg use the same paths.
 */
export const LOGO_CLOUD_PATH =
  'M13.5 38h21a8.4 8.4 0 0 0 1.4-16.7A12 12 0 0 0 13.6 19.6a9.2 9.2 0 0 0-.1 18.4Z';
export const LOGO_TRACES_PATH = 'M24 27.4V19.2l5-5.2M16.5 27.4v3.1l3 3V38M31.5 27.4v3.1l-3 3V38';
export const LOGO_NODES: readonly (readonly [number, number])[] = [
  [16.5, 24.9],
  [31.5, 24.9],
  [24, 29.9],
];
/** At 20 px and below the traces blur together, so the mark becomes the cloud and three dots. */
export const LOGO_SMALL_DOTS: readonly (readonly [number, number])[] = [
  [17, 28],
  [31, 28],
  [24, 25],
];
