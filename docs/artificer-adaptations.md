# Artificer adaptations

How this project bends the Artificer design system, and why. Each entry mirrors a
feedback issue filed upstream.

## 2026-08-02 — Upgrade 0.21.0 → 0.22.0, adopt the `.colophon__spine` footer

Replaced the hand-rolled `.app-footer` / `.footer-grid` / `.footer-col` / `.footer-fine`
rules with the Artificer three-zone `.colophon` primitive (zone 1: `.grid-auto` of
labeled sections; zone 2: `.colophon__spine` — identity, sign-off, links; zone 3:
`.colophon__fine`). This site keeps all three zones — it's the only sibling site using
the full shape. The existing Sourced/Disclosure content and the trademark clause carry
over verbatim; the site gains a copyright line and, for the first time, a
`kindness is a choice.` sign-off (a deliberate owner decision, not a prior omission).

`.footer-label` in `site/src/styles.css` stays — it's still used by the unrelated
`.concept-sources` footer in `ConceptPage.tsx`, which is not part of the colophon.

## 2026-06-01 — Initial scaffold (upstream: artificer-design-system#127)

| type | token / rule / pattern | what we did + why | upstream? |
|---|---|---|---|
| override | `.appbar` / `.appbar__brand` / `.wordmark` | Mobile shim (`flex: 1; min-width: 0` + ellipsis): the long wordmark + hamburger + theme toggle overflowed a 390px viewport by 16px because flex items refuse to shrink below min-content. See `site/src/styles.css` "Mobile: the long wordmark…" | yes |
| override | `.sidenav a` grammar | Carried the `.sidenav button` shim (third consumer to copy it) — SPA nav items are `<button>`s, which the system doesn't style | yes (known) |
| gap | categorical diagram palette | 8 node kinds mapped onto semantic tokens in `types.ts` `KIND_COLOR`; `decision → --urgent` and `git → --success` are color-distinct but semantically wrong — no qualitative ramp exists beyond `--series-1..5` | maybe |
| extension | none existed | `.misconception` myth/reality card (`--urgent-fill` Myth chip, `--accent-fill` Reality chip) for claim-vs-correction content | maybe |
| override | DOMContentLoaded one-shot binding | Copied SPA-consumer workarounds from siblings: `ArtificerIcons.observe()`, React-owned ThemeToggle, drawer focus-trap | yes |

**Don't upstream:** the concept-domain kind vocabulary and its token mapping; the
concept card grid / glossary / see-also compositions (plain uses of existing primitives).

## 2026-08-02 — Upgrade 0.10.1 → 0.21.0, provenance-tracked vendoring

Converted from hand-committed vendored files (no npm dependency, no way to tell what
version was in the tree) to `@cameronsjo/artificer` as a `site/package.json`
devDependency, re-vendored with `npx @cameronsjo/artificer vendor --fonts --dest
site/public/artificer`. Every vendored file now carries a `provenance.json` sidecar
recording its sha256, and `artificer.css` stamps `--art-version: "0.21.0"`.

This upgrade crosses the 0.18.0 root re-true (`html { font-size: 100% }` replaced a
silent 87.5% root — the whole rem-based type scale grew ~14.3%). Findings from the
static layout pass (no browser available this session — see below for what could and
could not be verified):

| type | token / rule / pattern | what we did + why | upstream? |
|---|---|---|---|
| audit | all `var(--*)` refs in `src/*.tsx`/`styles.css` | Diffed against the new `tokens.json`/`artificer.css` — zero tokens were removed or renamed between 0.10.1 and 0.21.0 (19 additions only), so no reference broke | n/a |
| confirmed safe | `LoopGraph.tsx` SVG geometry (`NODE_W`/`NODE_H`/font sizes) + `.loop-node-label` | Already isolated from the re-true by design — node dimensions and label `font-size: 12px` are raw px, not rem tokens, so the diagram canvas doesn't grow with the type scale. Added a comment at `styles.css` `.loop-node-label` explaining why the lint-flagged `12px` stays raw | no (working as intended) |
| confirmed safe | `.app-sidenav` sticky offset (`calc(56px + var(--s-md))`), `.appbar` height | Both `56px` and every `--s-*` spacing token are raw px (not rem) — unaffected by the root re-true | no |
| unverified | fixed-width columns: `.app-shell` sidenav (230px), `.player-body` inspector (340px), `.graph-modal__layout` side (300px) | Their contents use rem-based `--t-label-*` tokens, which did grow ~14.3%. Flex/grid `min-width: 0` patterns are already in place so nothing should overflow the viewport, but tighter wrapping inside these fixed columns could not be confirmed without a browser | flag for visual QA |
| unverified | mobile wordmark ellipsis (`.appbar__brand .whimsy` at `800px`/`390px`) | The `overflow: hidden; text-overflow: ellipsis` pattern degrades gracefully to arbitrary text width by design, but the actual truncation point at the new type scale was not visually confirmed | flag for visual QA |

Trivial lint fixes applied (`npx @cameronsjo/artificer lint` — 5 raw-value violations,
4 fixed): `.node-card-head` gap/margin, `.misconception__label` padding, and
`.source-list` gap now use `--s-xs`/`--s-sm` in place of raw `4px`/`8px`. The 5th
(`.loop-node-label` `font-size: 12px`) is deliberately left raw — see the "confirmed
safe" row above.

Surviving divergences from the 2026-06-01 entry (nothing upstream made obsolete):
the `.appbar` mobile shim and `.sidenav button` grammar are both still needed post-upgrade
— if anything, the mobile shim is now carrying more weight since the wordmark text is
14.3% wider at the same viewport.
