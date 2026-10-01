# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Awaiting next feature spec.

## Completed

- 01 Design system (`context/fearure-spec/01design-system.md`): shadcn/ui initialized (`base-nova` style, Base UI primitives); added button, card, dialog, input, tabs, textarea, scroll-area in `components/ui/` (unmodified); installed `lucide-react`; `lib/utils.ts` exports `cn()`; Ghost AI dark palette tokens defined in `app/globals.css`.
- 02 Editor chrome (`context/fearure-spec/02Editor.md`): client components mounted in the `/editor` layout; type-checked, linted, and builds.
  - `components/editor/editor-navbar.tsx` — fixed-height top bar, left/center/right sections, sidebar toggle (`PanelLeftOpen` / `PanelLeftClose`); right section now holds the `UserButton` (03).
  - `components/editor/projects-sidebar.tsx` — floating overlay that slides in from the left without pushing content; `isOpen` prop; header with "Projects" title + close button; shadcn Tabs (My Projects / Shared) with empty placeholders; full-width "New Project" button with `Plus` icon.
  - `components/editor/editor-shell.tsx` — client shell that owns sidebar open state and renders navbar + sidebar + a `<main>` canvas area.
  - `app/editor/layout.tsx` wraps all `/editor` routes in `EditorShell`; `app/editor/page.tsx` is an empty placeholder.
- 03 Auth (`context/fearure-spec/03`): Clerk wired into the app; `npm run build` passes.
  - `@clerk/nextjs` + `@clerk/ui` installed; keys and auth URLs in `.env.local` (gitignored) — `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
  - `app/layout.tsx` — `ClerkProvider` inside `<body>` using `clerkAppearance`.
  - `lib/clerk-appearance.ts` — Clerk `dark` theme with appearance variables mapped to palette CSS variables (no hardcoded colors).
  - `proxy.ts` (root) — `clerkMiddleware`; sign-in/sign-up URLs (from env) are public, every other route calls `auth.protect()`; matcher includes `/__clerk/:path*`.
  - `app/(auth)/layout.tsx` — 50/50 two-panel layout: `bg-surface` brand panel on `lg+` (Ghost logo in a `bg-brand` tile, bold headline, description, three features with `bg-accent-dim` icon tiles + title + one-line description), `bg-base` panel with the centered Clerk form; small screens show the form only. Revised from the spec's text-only list to match the user's reference screenshot.
  - `app/(auth)/sign-in/[[...sign-in]]`, `app/(auth)/sign-up/[[...sign-up]]` — Clerk `<SignIn />` / `<SignUp />`.
  - `app/page.tsx` — server redirect: signed in → `/editor`, signed out → sign-in URL.
  - `components/editor/editor-navbar.tsx` — Clerk `UserButton` in the right section (default menu, profile, and sign-out).
- 04 Project dialogs & editor home (`context/fearure-spec/04-project-dialogs.md`): mock data only, no API calls or persistence; type-checked, linted, builds, and verified in a headless browser.
  - `hooks/use-project-dialogs.ts` — dedicated hook owning dialog state (`activeDialog`, `targetProject`), form state (`name`), and loading state (`isSubmitting`); `submit()` calls injected `onCreate` / `onRename` / `onDelete` handlers.
  - `components/editor/project-dialogs.tsx` — Create (name input + live slug preview), Rename (prefilled, auto-focused via `initialFocus`, current name in description, Enter submits), Delete (destructive confirmation, no input, `destructive` button). Each dialog is a `<form>`; submit is disabled while empty/unchanged or submitting.
  - `components/editor/project-dialogs-context.ts` — context so `/editor` page content can open dialogs owned by the layout shell.
  - `components/editor/editor-home.tsx` + `app/editor/page.tsx` — centered heading, description, `New Project` button (no card) → Create dialog.
  - `components/editor/projects-sidebar.tsx` — project lists per tab (owned / shared), rename + delete icon actions only on owned projects (always visible on mobile, on hover/focus from `md`), sidebar `New Project` → Create dialog; mobile backdrop scrim below the navbar that closes the sidebar on tap.
  - `components/editor/editor-shell.tsx` — holds in-memory mock projects and wires the hook to the sidebar, dialogs, and context.
  - `types/project.ts` (`Project` with `isOwner`), `lib/mock-projects.ts`, `lib/slug.ts` (`slugify`).
  - Fixed a design-system token collision: `--color-base` made `text-base` (used by shadcn Dialog title and Input) also set text color to `--bg-base`, rendering it near-invisible. The token now lives in Tailwind's bg-only `--background-color-base` namespace; `bg-base` is unchanged.

- 05 Prisma schema and data layer (`context/fearure-spec/05-prisma.md`): migration applied, client generated, `npm run build` passes.
  - `prisma/models/project.prisma` — `ProjectStatus` enum (`DRAFT`, `ARCHIVED`); `Project` (`id`, `ownerId` = Clerk user ID, `name`, optional `description`, `status` default `DRAFT`, optional `canvasJsonPath`, `createdAt`/`updatedAt`; indexes on `ownerId` and `createdAt`); `ProjectCollaborator` (`id`, `projectId` → `Project` with `onDelete: Cascade`, `email`, `createdAt`; unique `[projectId, email]`; indexes on `email` and `[projectId, createdAt]`). `id` columns are the only additions Prisma requires.
  - `lib/prisma.ts` — exports a single `prisma` instance, cached on `global` outside production. `DATABASE_URL` starting with `prisma+postgres://` → `new PrismaClient({ accelerateUrl })`; otherwise → `@prisma/adapter-pg`. Throws if `DATABASE_URL` is unset.
  - `prisma/migrations/20261001144754_init` — first migration, applied to the local `prisma dev` database.

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Local `prisma dev` (the current `DATABASE_URL`, `prisma+postgres://localhost…`) rejects HTTP/Accelerate queries from Prisma Client 7.10 (`P6000`). Migrations work, and the `adapter-pg` path works against its TCP port, but app queries through the Accelerate branch will fail locally until `prisma dev` is updated or `DATABASE_URL` is switched to the direct `postgres://` URL.
- Editor is mounted at `/editor` for now; the final route (e.g. `/editor/[projectId]`) is not yet specified.
- Clicking a project in the sidebar does nothing yet — project routing (e.g. `/editor/[projectId]`) is not specified.

## Architecture Decisions

- Prisma 7 with a multi-file schema (`prisma.config.ts` points `schema` at `prisma/`). Import the client only via `lib/prisma.ts`, never `new PrismaClient()` elsewhere.
- Accelerate is used through the client's native `accelerateUrl` option — `@prisma/extension-accelerate` is not installed (add it only if query caching is needed).

- Auth is protect-by-default in `proxy.ts`: only the Clerk sign-in/sign-up URLs are public. New public routes must be added to `isPublicRoute` explicitly. Proxy is an optimistic check — API routes must still call `await auth()` and enforce ownership.
- Auth pages live in the `app/(auth)` route group so they share the two-panel layout without affecting URLs.
- Clerk styling is centralized in `lib/clerk-appearance.ts` (`dark` base + palette `var(--…)` variables); do not style Clerk internals elsewhere. `colorBorder` uses `--text-secondary` because Clerk renders borders at ~10% alpha of that color — `--border-default` would be invisible.
- Project dialogs: `EditorShell` owns the `useProjectDialogs` state and provides it via `ProjectDialogsContext`, so both the layout (sidebar) and page content (editor home) can open the same dialogs. Mutations are injected handlers — swap the in-memory mock updates for API calls later without touching the dialogs.
- The `base` background token is registered as `--background-color-base` (not `--color-base`) to avoid colliding with Tailwind's `text-base` font-size utility. Avoid `--color-*` token names that match Tailwind size keywords (`base`, `sm`, `lg`, `xl`, …).
- Theming: palette tokens from `ui-context.md` live on `:root` in `app/globals.css`. shadcn semantic variables (`--background`, `--primary`, `--card`, …) are aliased to those tokens, so shadcn components render in the Ghost AI palette without editing `components/ui/*`.
- The app is dark-only: `<html>` carries the `dark` class (so shadcn `dark:` variants always apply) and `color-scheme: dark`. No light theme is defined.
- `cn()` comes from shadcn's `cn` package (drop-in replacement for clsx + tailwind-merge), re-exported from `lib/utils.ts`.
- Editor chrome is controlled: `EditorNavbar` (`isSidebarOpen`, `onToggleSidebar`) and `ProjectsSidebar` (`isOpen`, `onClose`) hold no state; `EditorShell` (client) owns sidebar open state so `app/editor/layout.tsx` stays a Server Component. The sidebar is `position: fixed` below the 56px (`h-14`) navbar and slides via `translate-x`, so it overlays the canvas instead of pushing layout. When closed it is `inert` + `aria-hidden`.

## Session Notes

- `components.json` uses the `base-nova` style: components are built on `@base-ui/react`, not Radix. Add new components with `npx shadcn@latest add <name>`.
