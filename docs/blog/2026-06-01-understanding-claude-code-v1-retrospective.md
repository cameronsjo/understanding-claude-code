# Retro: understanding-claude-code v1 — scaffold to live site in one session

Raw material captured 2026-06-01. Session: plan-execution of the approved
`docs/plans/2026-06-01-understanding-claude-code-v1.md` — scaffold, verify, publish, and
hub-register a new GitHub Pages property explaining Claude Code concept by concept.

**Domain:** an educational SPA (React + Vite + TS) rendering JSON "concept specs" through a
diagram/player engine shared with two sibling repos (spec-compare, agentic-harnesses). v1 ships
the forks/branches cluster: four concepts, each with prose, an interactive step-through diagram,
and a myth/reality misconceptions block.

**Author framing:** Cameron built this because he personally got caught by the concepts it
explains — the plan's own words: "Cameron got caught by how 'forks' and 'branches' work in Claude
Code (Agent-tool forks vs subagents, conversation forks vs git branches/worktrees)." The site is
the fix.

## Decisions Made

- **A new sibling property, not a page in an existing repo.** The confusion got its own repo and
  deployment at `cameronsjo.github.io/understanding-claude-code/`. Reasoning from the plan: the
  repo family "already encodes how to do this" — template repos, an onboarding skill, a shared
  architecture — so a new property is cheap and keeps the single-subject framing clean.
  *Confidence: settled.*

- **Data-spec-first, same as the family.** The domain object is a **concept** (not a tool, not a
  harness): one JSON file per concept, AJV-validated against a schema, glob-discovered, rendered
  by shared components. Future clusters (hooks, permissions, MCP) are "JSON-only drops — zero
  engine changes." Alternatives weren't seriously considered; this is the family architecture and
  the plan treats it as given. *Confidence: settled.*

- **Copy from two siblings, not one.** Config/CI/index.html/Artificer vendor from **spec-compare**
  (newer Vite 6/Vitest 3, better CI hygiene); the diagram/player engine (LoopGraph, GraphModal,
  player, controls, Anchored) from **agentic-harnesses** (spec-compare has no GraphModal).
  *Confidence: settled.*

- **Keep LoopGraph byte-identical by bending the type layer instead.** `types.ts` keeps exporting
  the names LoopGraph imports (`LoopSpec`, `LoopEdge`, `KIND_COLOR`) but redefines the kind enum
  to concept-domain vocabulary. `data.ts` projects `concept.diagram` into a LoopSpec shape where
  the `harness` field (used for SVG marker namespacing) carries the concept slug. Reasoning: the
  engine stays mergeable with upstream improvements; the only engine-side delta in the whole repo
  is the KIND_COLOR map. *Confidence: settled.*

- **Eight node kinds mapped onto semantic Artificer tokens.** `session/fork/subagent/context/tool/
  git/decision/terminal` → `accent/accent-bright/brand-purple/steel/attention/success/urgent/
  fg-disabled`. The mapping runs out of semantically honest tokens: `decision → --urgent` and
  `git → --success` are color-distinct but mean the wrong thing. Used anyway because Artificer's
  hard rule is "existing tokens only" and no categorical ramp exists. *Confidence: good enough for
  now — filed upstream as a gap (artificer-design-system#127).*

- **Misconceptions (myth/reality/why) as the signature content block.** Every concept carries
  "the things that catch people" as first-class data, not buried prose. This is the site's
  framing device and the schema's most opinionated field. *Confidence: settled.*

- **Surface treatment, glossary, and content depth were decided with Cameron at plan time** (tool
  surface / mono body; glossary ships in v1; site specs only with docs/ deep-dives deferred) and
  executed without revisiting. *Confidence: settled by decision table.*

- **Hub registration is consts.ts only.** The onboarding-a-property skill said two registration
  points (consts.ts + Header.astro nav); Cameron flagged the second as stale in the plan, the
  session verified it (Header.astro: "the header carries no nav links — only the brand wordmark"),
  and the skill was corrected as part of the work. *Confidence: settled.*

- **CF analytics beacon ships without SRI.** A security hook flagged it; kept anyway because the
  hub's own BaseLayout documents the family decision: "no SRI hash because Cloudflare serves
  beacon.min.js mutable/unversioned." *Confidence: settled.*

## Friction & Dead Ends

- **agent-browser reported success for clicks that landed nowhere.** During the dev click-through,
  four consecutive clicks on the player's "Step ›" button — by ref and by semantic locator — all
  returned "✓ Done" while the step counter sat at "step 1 / 6". The diagnosis path went: stale
  refs? → React not receiving synthetic events? → JS `.click()` works, so the component is fine →
  `elementFromPoint` check → the button was at **y=1200 in a 720px viewport**. The clicks were
  dispatched at coordinates below the fold and hit nothing, successfully. The fix was
  `scrollIntoView` first; the lesson is that click "success" is not evidence — only the resulting
  state change is.

- **The 390px overflow was invisible to code review and obvious to measurement.** scrollWidth 406
  vs innerWidth 390. Cause: Artificer's `.appbar__brand` is a flex item with no `min-width: 0`, so
  the long wordmark ("understanding claude code") refuses to shrink and shoves the theme toggle
  16px past the viewport. The family CLAUDE.md already warned to verify mobile "by measuring
  (`scrollWidth` vs `innerWidth`), not by reading CSS" — this session is another data point for
  that rule. Fixed downstream with `flex: 1; min-width: 0` + ellipsis; both siblings carry long
  wordmarks and probably sit one or two characters from the same cliff.

- **The validator template carried a real bug into the new repo.** spec-compare's
  validate-tools.mjs gates each file's "✓" success line on the **module-global** `failed` flag, so
  one bad spec silently suppresses every later spec's success report. The adaptation inherited the
  bug; `cadence-forge:self-review` caught it (graded the new code 80%, 4 hard violations); the fix
  was per-file error arrays. The bug is still in the template repo.

- **Skill checklists rot.** The onboarding skill's Header.astro step described UI removed in the
  hub's launcher redesign. Caught by Cameron at plan time, not by the skill's own maintenance.

- **Push-before-Pages is a benign race, but a race.** Main was pushed before Pages was enabled;
  the deploy Action started anyway and happened to succeed (Pages enablement landed before the
  deploy job needed it). The skill now documents the re-check instead of assuming ordering.

## Opinions Formed

- **The "SPA consumer shim set" is an unowned layer, and that's now a three-repo fact.** Sidenav
  buttons (Artificer styles only `<a>`), `ArtificerIcons.observe()` after React mounts, a
  React-owned ThemeToggle, drawer focus-trap wiring, and now brand-shrink — every Artificer SPA
  consumer copies these from the previous consumer, and the copies drift. From the upstream issue
  filed this session: "The system either owns an SPA-consumer adapter, or it owns the fact that it
  doesn't."

- **Verification by measurement beats verification by reading.** Both real bugs found in Phase B
  (the overflow and the click failures) produced zero signal in the code and unambiguous signal in
  one measured number each.

- **A rules scorecard catches correctness bugs, not just style.** The self-review skill is framed
  as a style/discipline gate, but its highest-value finding here (the global-flag leak) was a
  behavior bug that testing the happy path would never surface.

## Implementation Notes

- **Concept schema (the creative core):** required `concept` (slug==filename), `displayName`,
  `cluster`, `tagline`, `summary`; optional `sections[]`, `diagram`, `scenarios[]`,
  `misconceptions[]` (`{myth, reality, why?}`), `related[]`, `sources[]`. Everything optional is
  optional so prose-only drafts can ship with `"status": "draft"`.

- **Validation invariants** (validate-concepts.mjs): filename == slug, unique diagram node ids,
  every edge endpoint and scenario step references a declared node, `related[]` slugs resolve to
  real files. Negative-tested in-session by corrupting a spec and checking exit codes (1 on fail,
  0 on pass) and per-file isolation (later files still print ✓ after an earlier ✗).

- **Diagram authoring contract for LoopGraph:** vertical column in declaration order; adjacent
  nodes get straight edges (author the main narrative as consecutive nodes); non-adjacent edges
  arc into side gutters (forward → right, backward → left) — so "returns to parent" edges are
  deliberate backward arcs. Scenario steps should follow declared edges so the player highlights
  the path, but the validator only enforces node existence.

- **The four v1 concepts:** `conversation-forks` (--continue / --resume / --fork-session, rewind),
  `agent-forks` (the trigger concept: subagent_type omitted = fork, set = subagent),
  `subagent-isolation-vs-fork` (inbound differs, outbound is one message for both),
  `git-branches-vs-claude-forks` (filesystem axis vs conversation axis, orthogonal).

- **Do differently:** fix the validator bug in spec-compare (the template) before the next
  property copies it; consider whether the SPA shim set should be extracted before a fourth
  consumer exists.

## Quotable Moments

From the approved plan (Cameron's framing):

> "Cameron got caught by how 'forks' and 'branches' work in Claude Code (Agent-tool forks vs
> subagents, conversation forks vs git branches/worktrees). The fix: a new educational site."

> "v1 nails the **forks/branches cluster**; the architecture extends to hooks, subagents, context,
> permissions, MCP 'in due time' with zero engine changes (new JSON specs only)."

> "Hub registration: `consts.ts` PROJECTS only (Header.astro step in skill is stale — fix the
> skill too)"

From content and feedback written during the session (the session's words, not Cameron's — see
honesty flags):

> "The tool is one tool with two modes, and the mode switch is a parameter you can simply not
> notice. This exact confusion motivated this site." — agent-forks misconception

> "'Fork' suggests an eventual 'join'. There is a join, but it's one message wide." —
> subagent-isolation misconception

> "The transcript *describes* the edits, so discarding it feels like discarding them. The disk
> doesn't read transcripts." — git-branches-vs-claude-forks misconception

> "The system either owns an SPA-consumer adapter, or it owns the fact that it doesn't." —
> artificer-design-system#127 narrative

## Open Threads

- Per-concept `docs/` deep-dive prose pages — explicitly deferred to a later PR.
- Future clusters (hooks, subagents, context, permissions, MCP) — JSON-only drops; the
  `add-concept` skill documents the path.
- **Node 20 actions deprecation (June 16, 2026)** — GitHub annotated the deploy run; the workflow
  was copied verbatim, so all three sibling repos need the same actions bump. One family-wide
  sweep.
- The appbar overflow is probably latent in spec-compare and agentic-harnesses (long wordmarks,
  same vendored CSS) — worth a 390px measurement pass on both.
- The validator global-flag bug still exists in spec-compare's validate-tools.mjs.
- artificer-design-system#127 (categorical diagram palette, SPA shim set) — awaiting maintainer
  triage.

## Honesty flags

- This was a **plan-execution session**: Cameron's voice appears in the approved plan document and
  its decision table, not in live back-and-forth. Most "Decisions Made" were pre-approved at plan
  time; their confidence tags are inferred from the plan's framing ("decisions made (with
  Cameron)") rather than stated by him during execution.
- The **Opinions Formed** section is the session's own findings (written into issue #127, the
  build summary, and this doc) — Cameron has not endorsed them. They are presented as opinions
  earned by the build, but the "author" holding them is the Claude session, not verifiably
  Cameron.
- Quotes in the second block of Quotable Moments are from JSON spec content and the upstream issue
  generated during the build — they are the session's writing in the project's voice, flagged as
  such, not Cameron's words.
- The claim that the appbar overflow is "probably latent" in the sibling repos is an inference
  from shared CSS and similar wordmark lengths; it was not measured this session.
