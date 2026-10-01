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

- 06 Project API routes (`context/fearure-spec/06-project-apis.md`): backend only, UI not wired; `npm run build` passes, lint clean; unauthenticated requests verified to return `401` on all four routes against `next start`.
  - `app/api/projects/route.ts` — `GET` lists the caller's owned projects (newest first) → `{ projects }`; `POST` creates with `ownerId` = Clerk `userId`, missing/blank `name` → `Untitled Project`, IDs from the schema's `cuid()` default → `201 { project }`.
  - `app/api/projects/[projectId]/route.ts` — `PATCH` renames (`name` required, trimmed) → `{ project }`; `DELETE` → `{ project }` (deleted record). Both check ownership first: unknown ID → `404`, non-owner → `403`. Params typed with Next's global `RouteContext`.
  - `lib/api-response.ts` — `{ error }` JSON helpers for `400`/`401`/`403`/`404`.
  - `lib/project-input.ts` — JSON body reader (empty body = `{}`, non-object → `400`) and create/rename input parsers.
  - `lib/project-access.ts` — `checkProjectOwnership(projectId, userId)` → `"owner" | "forbidden" | "not-found"`.
  - `proxy.ts` — `/api(.*)` is excluded from `auth.protect()` (Clerk's protect returns `404` to unauthenticated non-page requests); Clerk middleware still runs so handlers can call `auth()`.

- 07 Wire editor home (`context/fearure-spec/07-wire-editor-home.md`): mock data removed; `npm run build` passes, lint clean. Verified against the local DB: client-supplied ID create, duplicate ID → Prisma `P2002`, case-insensitive shared-project query; signed-out `/editor` and `/editor/[projectId]` redirect to Clerk, `POST /api/projects` → `401`.
  - `lib/project-data.ts` — `getEditorProjects()` (server): `auth.protect()`, then owned projects (`ownerId`) and shared projects (collaborator email matches any of the user's Clerk emails, case-insensitive, excluding owned), both newest first, mapped to `Project` (`id`, `name`, `isOwner`). Spec called this an "existing" helper; none existed, so it was added here.
  - `lib/project-id.ts` — project ID = Liveblocks room ID = `<slug>-<6-char base36 suffix>` (slug capped at 48 chars, `untitled-project` fallback); `isValidProjectId` (lowercase slug, ≤ 64 chars) used by the API.
  - `POST /api/projects` accepts an optional `id` (validated by `parseCreateProjectInput`); omitted → schema `cuid()`. Duplicate ID → `409` (`conflict()` in `lib/api-response.ts`).
  - `hooks/use-project-actions.ts` (replaces `use-project-dialogs.ts`) — dialog state, name input, ID suffix generated on open (so the preview equals the created ID), rename target `{ id, name }`, delete target `Project`, submitting + error state. Create → `POST` then `router.push('/editor/<id>')`; rename → `PATCH` then `router.refresh()`; delete → `DELETE` then `router.replace('/editor')` if it was the active workspace (`useParams().projectId`), else `router.refresh()`. Failures keep the dialog open and show the API error; a failed create regenerates the suffix.
  - `components/editor/project-dialogs.tsx` — create shows a live **Room ID** preview; rename pre-fills; delete shows the name; inline error line.
  - `components/editor/project-actions-context.ts` (renamed from `project-dialogs-context.ts`) — `useProjectActionsContext()` for `EditorHome`.
  - `components/editor/projects-sidebar.tsx` — takes `ownedProjects` / `sharedProjects`; project names link to `/editor/<id>`, active workspace highlighted (`aria-current`).
  - `app/editor/page.tsx` — async Server Component: fetches projects and renders `EditorShell` + `EditorHome`. `app/editor/layout.tsx` removed (see Architecture Decisions).
  - `app/editor/[projectId]/page.tsx` — minimal placeholder workspace (name + room ID) so create can navigate somewhere; `notFound()` unless the user owns or collaborates on the project.
  - Removed `lib/mock-projects.ts`; `Project.slug` dropped (the ID carries the slug).

## In Progress

- None.

## Next Up

- Awaiting next feature spec (workspace canvas / Liveblocks room for `/editor/[projectId]`).

## Open Questions

- Authenticated `403`/`404`/success paths of the project API are type-checked but not exercised end-to-end (needs a signed-in Clerk session; the underlying Prisma create/list/update/delete queries are verified against the local DB).
- `/editor/[projectId]` is a placeholder (name + room ID only); the workspace canvas is not specified yet.
- Signed-in create/rename/delete flows in the browser are not exercised end-to-end here (no Clerk test session); the API, queries, and build are verified.

## Architecture Decisions

- Prisma 7 with a multi-file schema (`prisma.config.ts` points `schema` at `prisma/`). Import the client only via `lib/prisma.ts`, never `new PrismaClient()` elsewhere.
- Local development uses the `prisma dev` **direct TCP** URL (`postgres://postgres:postgres@localhost:51214/template1?sslmode=disable`) in both `.env` (Prisma CLI) and `.env.local` (Next.js), so `lib/prisma.ts` takes the `@prisma/adapter-pg` path. The `prisma+postgres://localhost:51213` Accelerate URL is not used locally: `prisma dev` rejects Prisma Client 7.10's HTTP queries with `P6000`. If `prisma dev` restarts on different ports, re-read them with `npx prisma dev ls`.
- Rename/delete are owner-only (confirmed by user; recorded in `architecture-context.md`). Collaborators cannot rename or delete.
- Accelerate is used through the client's native `accelerateUrl` option — `@prisma/extension-accelerate` is not installed (add it only if query caching is needed).

- Auth is protect-by-default in `proxy.ts`: only the Clerk sign-in/sign-up URLs are public, and `/api/*` is excluded from `auth.protect()` so handlers can return proper `401`/`403` JSON. Every API handler must start with `await auth()` and return `401` when there is no `userId`. New public routes must be added to `isPublicRoute` explicitly. Proxy is an optimistic check — API routes must still call `await auth()` and enforce ownership.
- Auth pages live in the `app/(auth)` route group so they share the two-panel layout without affecting URLs.
- Clerk styling is centralized in `lib/clerk-appearance.ts` (`dark` base + palette `var(--…)` variables); do not style Clerk internals elsewhere. `colorBorder` uses `--text-secondary` because Clerk renders borders at ~10% alpha of that color — `--border-default` would be invisible.
- Project actions: `EditorShell` owns `useProjectActions` (dialog state + API mutations) and provides it via `ProjectActionsContext`, so both the sidebar and page content (editor home) can open the same dialogs. Mutations go through `/api/projects`; the UI updates via `router.refresh()` / navigation, never optimistic client state.
- Editor data flow: each `/editor` page (home, workspace) is an async Server Component that calls `getEditorProjects()` and renders `EditorShell` with the lists. There is no `app/editor/layout.tsx`, because a layout would not re-fetch on client navigation (e.g. the project list would miss a newly created project after `router.push`). Sidebar open state therefore resets between pages.
- Project ID = Liveblocks room ID (`<slug>-<suffix>`), generated client-side and validated by the API. This supersedes spec 06's "schema ID strategy" for UI-created projects; `cuid()` remains the fallback when no `id` is sent.
- The `base` background token is registered as `--background-color-base` (not `--color-base`) to avoid colliding with Tailwind's `text-base` font-size utility. Avoid `--color-*` token names that match Tailwind size keywords (`base`, `sm`, `lg`, `xl`, …).
- Theming: palette tokens from `ui-context.md` live on `:root` in `app/globals.css`. shadcn semantic variables (`--background`, `--primary`, `--card`, …) are aliased to those tokens, so shadcn components render in the Ghost AI palette without editing `components/ui/*`.
- The app is dark-only: `<html>` carries the `dark` class (so shadcn `dark:` variants always apply) and `color-scheme: dark`. No light theme is defined.
- `cn()` comes from shadcn's `cn` package (drop-in replacement for clsx + tailwind-merge), re-exported from `lib/utils.ts`.
- Editor chrome is controlled: `EditorNavbar` (`isSidebarOpen`, `onToggleSidebar`) and `ProjectsSidebar` (`isOpen`, `onClose`) hold no state; `EditorShell` (client) owns sidebar open state so `app/editor/layout.tsx` stays a Server Component. The sidebar is `position: fixed` below the 56px (`h-14`) navbar and slides via `translate-x`, so it overlays the canvas instead of pushing layout. When closed it is `inert` + `aria-hidden`.

## Session Notes

- `components.json` uses the `base-nova` style: components are built on `@base-ui/react`, not Radix. Add new components with `npx shadcn@latest add <name>`.
