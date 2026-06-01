---
name: add-concept
description: Use when adding a new concept to the understanding-claude-code site — a new JSON spec under site/src/data/concepts/. Covers the schema, the validation invariants, diagram/scenario authoring for LoopGraph, and the misconception framing.
---

# Add a Concept

Add a new concept page to the `site/` app. The rule that keeps this repo honest: **a page renders a JSON spec, it does not hardcode facts.** Everything the site says about a concept lives in one file under `site/src/data/concepts/<slug>.json`.

**Announce at start:** "Using add-concept to add the `<slug>` concept."

## Step 0 — Is it one concept?

A concept is one idea a person can hold: "forking copies the transcript", "subagents start with fresh context". If your draft needs two diagrams or the misconceptions pull in different directions, it's two concepts — split them and cross-link via `related[]`.

## Step 1 — Author the spec

Create `site/src/data/concepts/<slug>.json`. The schema (`schema.json`, AJV-enforced) requires:

- `concept` — the slug; **must equal the filename**
- `displayName`, `tagline`, `summary` — the card, glossary, and page-opener text
- `cluster` — one of `forks-branches | hooks | subagents | context | extensibility | permissions | mcp`

Optional but expected for a full page:

- `sections[]` — `{heading, body[]}` prose. Use `**bold**` for Artificer anchor words (3–5 per paragraph); no other markdown.
- `diagram` — `{caption?, nodes[], edges[]}`. Node `kind` comes from the concept vocabulary (`session | fork | subagent | context | tool | git | decision | terminal`).
- `scenarios[]` — `{id, title, steps[]}` step-throughs over the diagram. Ids are concept-local.
- `misconceptions[]` — `{myth, reality, why?}`. **This is the signature framing of the site** — what does someone wrongly believe, what's actually true, and why is the wrong belief so natural?
- `related[]` — slugs of other concepts (validated to resolve)
- `sources[]` — `{label, ref?}` provenance. Every behavioral claim should be checkable here.

Prose-only drafts are fine: `diagram`/`scenarios`/`misconceptions` are all optional. Mark them `"status": "draft"`.

## Step 2 — Diagram authoring for LoopGraph

The diagram renders as a **vertical column of nodes** in declaration order:

- **Adjacent nodes** (declared consecutively) connect with straight edges — author the main narrative path as consecutive nodes.
- **Non-adjacent edges** render as side arcs: forward → right gutter, backward → left gutter. Use backward arcs for "returns to" edges.
- Give every node a `note` — it's the inspector text when that node is the active step.
- Scenario `steps[]` should follow declared edges so the player highlights the path (the validator only enforces that steps reference real nodes).

## Step 3 — New cluster? New kind?

- A **new cluster value** needs: the `cluster` enum in `schema.json` AND `CLUSTER_LABEL`/`CLUSTER_ORDER` in `types.ts`.
- A **new node kind** needs: the `kind` enum in `schema.json` AND `KIND_COLOR`/`KIND_LABEL` in `types.ts` (pick an existing Artificer token — no new colors).
- Within existing clusters and kinds, **no code changes at all** — drop the JSON and it appears.

## Step 4 — Verify

```bash
cd site && npm run build   # validate + tsc + vite — must exit 0
npm run dev                # click the new concept; step its scenarios; check the glossary entry
```

Confirm: the card appears under its cluster, scenarios step through the diagram, misconceptions render, `related[]` chips navigate, and the glossary lists it.

## Anti-patterns

- **Hardcoding concept facts in a component.** Everything lives in the JSON spec.
- **Behavioral claims without a source.** If you can't cite it, mark the concept `draft` and say so in the prose.
- **Misconceptions that are just FAQs.** A misconception names a *wrong belief* and explains why it's natural to hold — "myth/reality/why", not "question/answer".
- **Diagrams with more than ~7 nodes.** Split the concept or simplify the story.
- **New colors or bespoke CSS for one concept.** The kind vocabulary + Artificer tokens are the palette.
