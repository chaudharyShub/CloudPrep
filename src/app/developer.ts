/** Who made CloudPrep, shown in the sidebar footer and on the Privacy page (D-056). */
export const DEVELOPER = {
  name: 'Shubham Chaudhary',
  url: 'https://shubhamworks.vercel.app/',
  /** "All projects": the portfolio's plain project list (no startup screen). */
  projectsUrl: 'https://shubhamworks.vercel.app/projects',
} as const;

/** The umbrella name shared by all the developer's sites (D-062). */
export const MAKER_BRAND = 'Shubham Works';

/** The developer's other practice site, linked under the credit (D-059). */
export const FRONTEND_PREP = {
  name: 'Frontend Interview Prep',
  url: 'https://frontend-interview-prepare.vercel.app/',
} as const;

/** The developer's Git guide (D-073). */
export const GIT_DRAWN_OUT = {
  name: 'Git, Drawn Out',
  url: 'https://git-drawn-out.vercel.app/',
} as const;

/**
 * "Also:" in the footer (D-073, `docs/SHUBHAM_WORKS.md`): at most 3 of the developer's other
 * sites, newest first, never CloudPrep itself. A new site goes first; past 3 the oldest drops off.
 */
export const OTHER_SITES: readonly { name: string; url: string }[] = [GIT_DRAWN_OUT, FRONTEND_PREP];
