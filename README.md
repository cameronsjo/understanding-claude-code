# Understanding Claude Code

Claude Code, concept by concept — interactive explanations of the ideas that catch people.

## 🔮 Live site

**[cameronsjo.github.io/understanding-claude-code](https://cameronsjo.github.io/understanding-claude-code/)**

- **Concepts index** — every concept as a card, grouped by cluster.
- **Concept pages** — prose, an interactive step-through diagram, the misconceptions that catch people, and sources.
- **Glossary** — every term alphabetically, linking into its concept page.

### v1: the forks & branches cluster

The first cluster untangles the words "fork" and "branch", which Claude Code uses for several different things:

| Concept | The one-liner |
|---|---|
| **Conversation Forks** | `--fork-session` copies the transcript into a new session; the original is never touched. |
| **Agent Forks vs Subagents** | The Agent tool **without** `subagent_type` forks you (full context); **with** it, spawns an isolated specialist (fresh context). |
| **What Crosses the Boundary** | Into a fork: everything. Into a subagent: only the prompt. Back out of either: only the final message. |
| **Git Branches vs Claude Forks** | Git branches the files; Claude forks the conversation. Orthogonal axes — neither creates the other. |

Future clusters (hooks, subagents, context, permissions, MCP) drop in as new JSON specs — no engine changes.

## Developing the site

The site lives in [`site/`](site/) — a React + Vite + TypeScript app on a vendored copy of the
[Artificer design system](https://cameronsjo.github.io/artificer/). Each concept is one JSON file under
`site/src/data/concepts/`, auto-discovered and AJV-validated against `schema.json`; the index, sidenav,
and glossary are *derived* from those files (single source of truth).

```bash
cd site
npm install
npm run dev        # local dev server
npm run validate   # AJV-validate every concept JSON + cross-concept invariants
npm run build      # validate → tsc → vite build (outputs site/dist/)
npm run preview    # serve the production build locally
```

Pushing to `main` builds and publishes `site/dist/` to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Adding a concept

Use the `add-concept` skill (`.claude/skills/add-concept/`) — or by hand:

1. Create `site/src/data/concepts/<slug>.json` matching `schema.json` (filename == `concept` slug).
2. `npm run validate` — schema + invariants (node id uniqueness, edge/scenario references, `related[]` resolution).
3. If the concept opens a new cluster, it just works — clusters with content appear automatically.

## Provenance

Independent and unofficial. Concept explanations are derived from the public
[Claude Code documentation](https://docs.claude.com/en/docs/claude-code/overview), observed tool behavior,
and the sibling [agentic-harnesses](https://cameronsjo.github.io/agentic-harnesses/) source analysis.
Claude Code moves fast — details can drift out of date; each concept cites its sources.

No affiliation with, sponsorship by, or endorsement from Anthropic.

## License

MIT — see [LICENSE](LICENSE).
