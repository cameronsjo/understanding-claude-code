# understanding-claude-code — New GitHub Pages Property

> Approved plan, 2026-06-01. Source of truth for the v1 build.

## Context

Cameron got caught by how "forks" and "branches" work in Claude Code (Agent-tool forks vs subagents, conversation forks vs git branches/worktrees). The fix: a new educational site, **understanding-claude-code**, deployed as a sibling property at `https://cameronsjo.github.io/understanding-claude-code/`, explaining Claude Code concept by concept. v1 nails the **forks/branches cluster**; the architecture extends to hooks, subagents, context, permissions, MCP "in due time" with zero engine changes (new JSON specs only).

The repo family already encodes how to do this:

- **Template**: copy `spec-compare` (newer Vite 6/Vitest 3, better CI hygiene) + diagram/player components from `agentic-harnesses`
- **Onboarding**: the `onboarding-a-property` skill checklist (hub registration, Pages, lockfile trap)
- **Architecture**: data-spec-first — JSON concept specs + AJV schema, glob-imported, rendered by shared React components

### Decisions made (with Cameron)

| Decision | Choice |
|---|---|
| Surface treatment | **Tool surface** — mono body, match siblings |
| Glossary view | **Ship in v1** |
| Content depth | **Site specs only** — docs/ deep-dives in a later PR |
| GitHub setup (repo create, Pages enable, push) | **Pre-approved** |
| Hub registration | `consts.ts` PROJECTS only (Header.astro step in skill is stale — fix the skill too) |

## What's different from siblings

Single-subject explanatory site, not a comparison. Drop all comparison views (FeatureMatrix, ScoringHeatmap, DecisionGuide, ScenarioCompare, WireView). The domain object is a **concept**, not a tool/harness. The reusable engine (LoopGraph SVG renderer, usePlayerTimer, TransportBar/TabPicker, GraphModal, Anchored) carries over verbatim.

## Concept schema (the creative core)

`site/src/data/concepts/schema.json` — JSON Schema 2020-12, `additionalProperties: false`:

- **Required**: `concept` (slug = filename), `displayName`, `cluster` (enum: `forks-branches | hooks | subagents | context | extensibility | permissions | mcp`), `tagline`, `summary`
- **Optional**: `order`, `status` (`stable|draft`)
- **`sections[]`**: `{heading, body[]}` — paragraphs with `**anchor**` markup (Anchored component, no markdown engine)
- **`diagram`**: `{caption?, nodes[], edges[]}` — same node/edge contract as loop schema so LoopGraph renders unchanged. Concept-domain `kind` enum: `session | fork | subagent | context | tool | git | decision | terminal`
- **`scenarios[]`**: `{id, title, steps[], note?}` — steps reference diagram node ids; concept-local ids
- **`misconceptions[]`**: `{myth, reality, why?}` — the "things that catch you" framing
- **`related[]`**: concept slugs (validated to resolve)
- **`sources[]`**: `{label, ref?}` — provenance

**Validation invariants** (validate-concepts.mjs): filename == slug, unique node ids, every edge/scenario step references a declared node, `related[]` slugs resolve to real files.

## v1 content — forks/branches cluster (4 specs)

1. **`conversation-forks`** — `--fork-session`, rewind, `--resume` vs `--continue`
2. **`agent-forks`** — THE trigger concept. Agent tool without `subagent_type` = fork; with = isolated subagent
3. **`subagent-isolation-vs-fork`** — what crosses the boundary each way
4. **`git-branches-vs-claude-forks`** — filesystem axis vs conversation axis are orthogonal

## Site views (v1)

1. **Concepts index** (default) — cards grouped by cluster
2. **Concept page** — summary, sections, diagram + step-through player, misconceptions, "see also" chips, sources
3. **Glossary** — alphabetical displayName + tagline list

## Implementation sequence

- **Phase A** — Scaffold (local): copy verbatim set, write engine adaptations, author 4 concept JSONs, write docs/skill
- **Phase B** — Verify (local): npm install, lockfile tracked, build exit 0, dev click-through
- **Phase C** — Publish (pre-approved): gh repo create, push, enable Pages with build_type=workflow
- **Phase D** — Register on hub: consts.ts PROJECTS entry, CF analytics comment, hub build, fix stale skill step

## Verification

- `npm run build` exit 0 (AJV validation + tsc + vite)
- Dev click-through: 4 concepts render, scenarios step, glossary links, theme toggle, 390px no h-scroll
- After C: `curl -sI https://cameronsjo.github.io/understanding-claude-code/` returns 200
- After D: hub build green, launcher shows new property
