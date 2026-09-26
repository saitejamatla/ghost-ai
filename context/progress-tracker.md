# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation

## Current Goal

- Awaiting next feature spec.

## Completed

- 01 Design system (`context/fearure-spec/01design-system.md`): shadcn/ui initialized (`base-nova` style, Base UI primitives); added button, card, dialog, input, tabs, textarea, scroll-area in `components/ui/` (unmodified); installed `lucide-react`; `lib/utils.ts` exports `cn()`; Ghost AI dark palette tokens defined in `app/globals.css`.

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Theming: palette tokens from `ui-context.md` live on `:root` in `app/globals.css`. shadcn semantic variables (`--background`, `--primary`, `--card`, …) are aliased to those tokens, so shadcn components render in the Ghost AI palette without editing `components/ui/*`.
- The app is dark-only: `<html>` carries the `dark` class (so shadcn `dark:` variants always apply) and `color-scheme: dark`. No light theme is defined.
- `cn()` comes from shadcn's `cn` package (drop-in replacement for clsx + tailwind-merge), re-exported from `lib/utils.ts`.

## Session Notes

- `components.json` uses the `base-nova` style: components are built on `@base-ui/react`, not Radix. Add new components with `npx shadcn@latest add <name>`.
