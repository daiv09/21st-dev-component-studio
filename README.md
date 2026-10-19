# 21st Dev Component Studio

A Next.js component gallery for interactive, motion-heavy React studies.

## Repository Structure

```text
app/
  demos/            Thin demo route entries that import from components/.
  submitted/        Submitted demo route entries.
  preview/          Preview route entry.
  globals.css       Tailwind theme tokens and app-wide base styles.
components/
  draft/            Components still in progress, demos, shared UI, and experiments.
  submitted/        Completed component submissions and their assets.
  featured/         Components selected for the featured collection.
hooks/              Shared React hooks.
lib/                Shared utilities and catalog metadata.
public/             Static assets served by Next.js.
scripts/            Capture, asset, and maintenance utilities.
```

## Conventions

- Keep all component implementations and component-specific files under exactly
  one of `components/draft`, `components/submitted`, or `components/featured`.
- Use a kebab-case folder per component and a same-named `.tsx` entry file;
  colocate that component's README, image, and video assets in the same folder.
- Keep app page files as thin route entries that import from `components/`.
- Demo URLs under `/components/...` are rewritten to `app/demos/...`, so route
  files do not create a second `components` directory.
- Put shared non-component utilities in `hooks/` and `lib/`.
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
