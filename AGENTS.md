# Agent Notes

A small Next.js 15 LMS app using the App Router, React 19, Supabase SSR cookie auth, and shadcn/ui (New York style).

## Daily commands

- `npm run dev` — start local dev server on localhost:3000
- `npm run lint` — ESLint only
- `npm run build` — Next.js production build

There is no `test`, `typecheck`, or `format` script in package.json. Run type checking through the editor or `npx tsc --noEmit` if needed.

## Architecture

- Entrypoints:
  - `app/layout.tsx` — root layout with `next-themes`
  - `app/page.tsx` — marketing/landing page
  - `app/auth/*` — login, signup, forgot/update password, confirmation
  - `app/dashboard/*` — authenticated student routes
  - `app/admin/*` — authenticated admin routes
- Supabase clients:
  - `lib/supabase/client.ts` — browser client (`"use client"` forms import this)
  - `lib/supabase/server.ts` — async server client for Server Components / Server Actions
  - `lib/supabase/proxy.ts` — session refresh in middleware-style proxy
- Session refresh is handled by `proxy.ts` at the project root, **not** `middleware.ts`. It is mounted as a route handler pattern via `export const config.matcher`.
- `lib/utils.ts` exports `cn()` and `hasEnvVars`; the env-var check is used by the Supabase session proxy.

## Auth behavior to keep intact

- Always create a fresh Supabase client per function call; do not cache in module-level variables (required for Fluid compute / SSR correctness).
- In `proxy.ts`, do not run code between `createServerClient` and `supabase.auth.getClaims()`; always return the same `supabaseResponse` object to avoid terminating sessions early.
- `AuthButton` and dashboard route helpers read the user via `supabase.auth.getClaims()`.
- `proxy.ts` redirects unauthenticated users to `/auth/login` for all non-auth routes except static/image assets.

## Linting

- ESLint flat config in `eslint.config.mjs` extends `next/core-web-vitals` and `next/typescript`.
- `npm run lint` runs `eslint .` and currently lints `.next/` and `node_modules/`, producing thousands of errors. Lint source only with `npx eslint app components lib proxy.ts`.
- `tailwind.config.ts` uses `require("tailwindcss-animate")`; this triggers `@typescript-eslint/no-require-imports` but is the standard Tailwind plugin loading pattern.

## Conventions

- Alias `@/*` maps to `./*` (`tsconfig.json`)
- shadcn/ui components live in `components/ui/*` and use Radix + Tailwind + `lucide-react`
- Tailwind config uses CSS variables for colors (`tailwind.config.ts` + `app/globals.css`)
- `next.config.ts` enables `cacheComponents`.
- Forms call Supabase directly from client components rather than using Server Actions.

## Must follow rules OR gradma dies
1. **Never use next.js Server Actions. Always use next API routes https://nextjs.org/docs/pages/building-your-application/routing/api-routes**
2. **Always use local running instance of Supabase while developing**
3. **For supabase db migrations, always use declarative schemas. Never modify the db directly**
4. **Always load the supabase and supsbase-postgres skills in the project for best practices**
