# Artificer adaptations

How this project bends the Artificer design system, and why. Each entry mirrors a
feedback issue filed upstream.

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
