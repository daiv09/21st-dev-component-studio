# 21st Dev Component Studio

A Next.js component gallery for interactive, motion-heavy React studies.

## Repository Structure

```text
app/
  components/       Stable demo routes, one folder per component.
  submitted/        Completed submissions and featured experiments.
  todo/             Draft routes that are intentionally not stable yet.
  globals.css       Tailwind theme tokens and app-wide base styles.
  page.tsx          Gallery index generated from lib/component-catalog.ts.
components/
  hero/             Hero-specific component assets.
  studio/           Shared studio experiments and non-route component drafts.
  ui/               shadcn/ui primitives.
hooks/              Shared React hooks.
lib/                Shared utilities and catalog metadata.
public/             Static assets served by Next.js.
```

## Conventions

- Use kebab-case folder names for every route component.
- Keep route pages in `app/**/page.tsx` and colocate the component, README,
  image, or video assets inside the same route folder.
- Put shared primitives in `components/ui`, shared gallery utilities in `lib`,
  and temporary experiments in `components/studio/drafts`.
- Add new gallery routes to `lib/component-catalog.ts` so the home page stays
  current without importing every demo component into the root bundle.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Run checks before submitting larger changes:

```bash
npm run lint
npm run build
```

## Notes

The app intentionally uses system font stacks instead of `next/font/google`, so
production builds do not depend on fetching Google Fonts during CI or local
offline work.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deploy

Deploy with any standard Next.js host. Vercel works out of the box for this
project shape.
