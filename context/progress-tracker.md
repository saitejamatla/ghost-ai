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
## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Editor is mounted at `/editor` for now; the final route (e.g. `/editor/[projectId]`) is not yet specified.
- "New Project" button has no action yet — behavior not specified.

## Architecture Decisions

- Auth is protect-by-default in `proxy.ts`: only the Clerk sign-in/sign-up URLs are public. New public routes must be added to `isPublicRoute` explicitly. Proxy is an optimistic check — API routes must still call `await auth()` and enforce ownership.
- Auth pages live in the `app/(auth)` route group so they share the two-panel layout without affecting URLs.
- Clerk styling is centralized in `lib/clerk-appearance.ts` (`dark` base + palette `var(--…)` variables); do not style Clerk internals elsewhere. `colorBorder` uses `--text-secondary` because Clerk renders borders at ~10% alpha of that color — `--border-default` would be invisible.
- Theming: palette tokens from `ui-context.md` live on `:root` in `app/globals.css`. shadcn semantic variables (`--background`, `--primary`, `--card`, …) are aliased to those tokens, so shadcn components render in the Ghost AI palette without editing `components/ui/*`.
- The app is dark-only: `<html>` carries the `dark` class (so shadcn `dark:` variants always apply) and `color-scheme: dark`. No light theme is defined.
- `cn()` comes from shadcn's `cn` package (drop-in replacement for clsx + tailwind-merge), re-exported from `lib/utils.ts`.
- Editor chrome is controlled: `EditorNavbar` (`isSidebarOpen`, `onToggleSidebar`) and `ProjectsSidebar` (`isOpen`, `onClose`) hold no state; `EditorShell` (client) owns sidebar open state so `app/editor/layout.tsx` stays a Server Component. The sidebar is `position: fixed` below the 56px (`h-14`) navbar and slides via `translate-x`, so it overlays the canvas instead of pushing layout. When closed it is `inert` + `aria-hidden`.

## Session Notes

- `components.json` uses the `base-nova` style: components are built on `@base-ui/react`, not Radix. Add new components with `npx shadcn@latest add <name>`.
