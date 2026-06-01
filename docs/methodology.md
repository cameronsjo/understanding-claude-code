# Methodology

How these concept explanations are produced, and what they're grounded in.

## Principle

Every claim about Claude Code behavior is grounded in a citable source: the public
documentation, the observable tool contract (the descriptions Claude Code presents to the
model), or the sibling [agentic-harnesses](https://cameronsjo.github.io/agentic-harnesses/)
source analysis. Each concept spec carries a `sources[]` block; the site renders it as the
page footer.

## Source tiers

1. **Public docs** (`docs.claude.com/en/docs/claude-code/…`) — authoritative for CLI flags,
   subagent configuration, checkpointing.
2. **Observed tool contract** — the Agent tool description and behavior as presented in
   Claude Code 2.x sessions. Reliable for what the tool says it does; versioned by
   observation date, not by release.
3. **agentic-harnesses analysis** — loop-level reconstruction from the recovered
   2.1.88 source. Treated as *informed reconstruction*, not authoritative; used for
   architecture framing, never for user-facing behavioral claims that the docs contradict.

## Caveats

- Claude Code ships fast. Concept pages describe behavior at the time their sources were
  checked; flags and defaults can change.
- Deep-dive prose documents (per-concept `docs/` pages) are planned but deferred — v1
  ships site specs only.
