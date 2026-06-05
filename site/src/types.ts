// Domain types for concept specs, plus the LoopSpec/LoopEdge/KIND_COLOR contract
// that the verbatim-copied LoopGraph.tsx renders. The graph engine is shared with
// the sibling repos (agentic-harnesses, spec-compare); only the kind vocabulary
// here is concept-domain.

/** Node kinds for concept diagrams — what each box in a diagram represents. */
export type NodeKind =
  | 'session'
  | 'fork'
  | 'subagent'
  | 'context'
  | 'tool'
  | 'git'
  | 'decision'
  | 'terminal'

export interface LoopNode {
  id: string
  label: string
  kind: NodeKind
  note?: string
}

export interface LoopEdge {
  from: string
  to: string
  on?: string
  label?: string
}

/**
 * The shape LoopGraph renders. For concepts this is derived from a ConceptSpec's
 * `diagram` by `diagramSpec()` in data.ts — `harness` doubles as the unique SVG
 * marker namespace (document-scoped ids), so it carries the concept slug.
 */
export interface LoopSpec {
  harness: string
  displayName: string
  nodes: LoopNode[]
  edges: LoopEdge[]
}

// Node kind → Artificer semantic token. Categorical, but restrained to the system palette.
export const KIND_COLOR: Record<NodeKind, string> = {
  session: 'var(--accent)',
  fork: 'var(--accent-bright)',
  subagent: 'var(--brand-purple)',
  context: 'var(--steel)',
  tool: 'var(--attention)',
  git: 'var(--success)',
  decision: 'var(--urgent)',
  terminal: 'var(--fg-disabled)',
}

export const KIND_LABEL: Record<NodeKind, string> = {
  session: 'conversation session',
  fork: 'fork (a copy)',
  subagent: 'subagent (isolated)',
  context: 'context window',
  tool: 'tool call',
  git: 'git / filesystem',
  decision: 'branch point',
  terminal: 'result',
}

// ---- Concept spec (mirrors site/src/data/concepts/schema.json) ----

export type Cluster =
  | 'agent-sdk'
  | 'forks-branches'
  | 'hooks'
  | 'subagents'
  | 'context'
  | 'extensibility'
  | 'permissions'
  | 'mcp'

export interface ConceptSection {
  heading: string
  /** Paragraphs. `**bold**` spans render as Artificer anchor words via <Anchored>. */
  body: string[]
}

export interface ConceptDiagram {
  caption?: string
  nodes: LoopNode[]
  edges: LoopEdge[]
}

export interface ConceptScenario {
  id: string
  title: string
  /** Ordered diagram node ids the scenario steps through. */
  steps: string[]
  note?: string
}

export interface Misconception {
  myth: string
  reality: string
  why?: string
}

export interface ConceptSource {
  label: string
  ref?: string
}

export interface ConceptSpec {
  /** Stable slug; matches the filename. */
  concept: string
  displayName: string
  cluster: Cluster
  tagline: string
  summary: string
  order?: number
  status?: 'stable' | 'draft'
  sections?: ConceptSection[]
  diagram?: ConceptDiagram
  scenarios?: ConceptScenario[]
  misconceptions?: Misconception[]
  /** Slugs of related concepts (validated to resolve). */
  related?: string[]
  sources?: ConceptSource[]
}

export const CLUSTER_LABEL: Record<Cluster, string> = {
  'agent-sdk': 'Agent SDK',
  'forks-branches': 'Forks & branches',
  subagents: 'Subagents',
  context: 'Context',
  hooks: 'Hooks',
  permissions: 'Permissions',
  extensibility: 'Extensibility',
  mcp: 'MCP',
}

/** Canonical sidenav / index ordering of clusters. Empty clusters don't render. */
export const CLUSTER_ORDER: Cluster[] = [
  'agent-sdk',
  'forks-branches',
  'subagents',
  'context',
  'hooks',
  'permissions',
  'extensibility',
  'mcp',
]
