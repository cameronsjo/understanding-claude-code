# understanding-claude-code

An educational site explaining Claude Code concept by concept. The `site/` SPA renders
concept pages, interactive diagrams, and a glossary from JSON concept specs.

## Commands (run from `site/`)

- `npm run dev` — Vite dev server
- `npm run build` — validate-concepts + tsc + vite (the full gate; run before claiming done)
- `npm run validate` — validate concept JSON specs against the schema + cross-concept invariants

## Layout

- `site/` — Vite + React 18 + TS SPA; source in `site/src/`.
- `site/src/data/concepts/*.json` — concept specs, **auto-discovered** by `data.ts`.
  Add a concept by dropping a JSON here; no nav edits needed. Clusters appear when
  they have content.
- `site/public/artificer/` — vendored Artificer design system (CSS + `<script>` helpers).
  **Generated, not hand-edited.** Re-vendor with `npx @cameronsjo/artificer vendor --fonts
  --dest site/public/artificer` (the package is a `site/` devDependency). `provenance.json`
  records the source version and a sha256 per file — a hand-edit breaks it and is
  overwritten on the next re-vendor. Fixes belong upstream in artificer-design-system;
  local divergences go in `docs/artificer-adaptations.md`.
- `docs/` — methodology, plans.
- The diagram/player engine (`LoopGraph.tsx`, `GraphModal.tsx`, `player.ts`, `controls.tsx`,
  `Anchored.tsx`) is **shared verbatim with the sibling repos** (agentic-harnesses,
  spec-compare). Improvements belong upstream in those repos first; keep the copies in sync.

## Conventions & gotchas

- **A page renders a JSON spec — never hardcode concept facts in components.** Use the
  `add-concept` skill.
- **Tool surface, dark-first.** Mono body (`--font-mono`), Artificer tokens only
  (`--dia-*`, `--s-*`, `--accent`); no raw hex, no bespoke spacing.
- **Concept-domain node kinds** (`session | fork | subagent | context | tool | git |
  decision | terminal`) live in `types.ts` (`KIND_COLOR` / `KIND_LABEL`) and
  `schema.json` — both must change together.
- **Consuming Artificer here:** its vendored scripts bind once on `DOMContentLoaded` and
  miss React-mounted nodes — the App calls `ArtificerIcons.observe()` and owns the theme
  toggle in React for this reason.
- **Mobile/responsive:** shell grid tracks are `minmax(0, 1fr)` — never bare `1fr` (its
  `auto` minimum blocks shrinking; the page blows out sideways). Mobile overrides go
  *after* the desktop rules they override. Verify at 390px by measuring
  (`scrollWidth` vs `innerWidth`), not by reading CSS.
- **agent-browser clicks below the fold silently no-op** — the CLI reports ✓ Done but
  the click lands outside the viewport and React state never changes. `scrollIntoView`
  first, then verify state changed after every click.
- **Accuracy is the product.** Every concept claim should be checkable against the cited
  sources. When Claude Code behavior changes, update the spec AND its `sources[]`.
