# Shubham Works: the shared footer (D-062)

"Shubham Works" is the umbrella name for the developer's sites: the portfolio
(https://shubhamworks.vercel.app/), CloudPrep and Frontend Interview Prep. Each site keeps
its own logo and URL. What ties them together is the same small footer block on every site.
This page is the reference for adding it to the other sites. CloudPrep's version is `MadeBy`
in `src/components/layout/Brand.tsx`.

## The block

```
[SW] A Shubham Works project
Made by Shubham Chaudhary ↗       (links to the portfolio)
Also: Frontend Interview Prep ↗   (the developer's other sites, linked)
```

Rules, so it reads the same everywhere:

- Same wording and order on every site. "Also:" lists the other practice sites, never the
  current one, in this order: CloudPrep, Frontend Interview Prep (new tab,
  `rel="noopener noreferrer"`). On the portfolio, "Also:" lists both.
- Keep it in one column (the mark beside the first line only), so it fits a narrow sidebar.
- On the portfolio, the "Made by" line can link to the About section or be plain text.
- Small, quiet text in the site's own muted colour; only the mark is orange. It never
  replaces the site's own logo.
- The mark is decorative (`aria-hidden="true"`); the text "A Shubham Works project" carries
  the meaning.
- When a new project is added, add it to "Also:" on every other site.

## The mark: the Dial

The user chose the "Dial" on 2026-11-01: a wide, squared SW inside a ring, in orange. Two
versions, both drawn on a 48×48 grid as plain shapes (no font needed):

- `docs/brand/shubham-works-dial.svg`: the detailed version with an inner ring and tick
  marks. Use it at 32px and up: the portfolio header, link previews, about pages.
- `docs/brand/shubham-works-dial-small.svg`: a thick ring and larger letters, for 16–24px:
  footers and favicons.

Colours: orange `#f97316` on dark backgrounds or as a general brand colour. In CloudPrep the
footer mark uses the `maker` token (`#c2410c` on light, `#fb923c` on dark, both checked for
3:1 contrast). On another site, swap `stroke` for that site's own orange, or for
`currentColor` to take the text colour. A soft glow (as in the original image) is fine on large
versions on dark backgrounds; leave it off small ones.

If the drawing changes, update `src/components/brand/MakerMark.tsx`, both SVG files and this
page together.

## Later

A shared domain (for example `cloudprep.<domain>`) was discussed and postponed by the user
on 2026-11-01; the sites keep their current `vercel.app` addresses for now.
