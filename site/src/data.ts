import type { Cluster, ConceptSpec, ConceptScenario, LoopSpec } from './types'
import { CLUSTER_ORDER } from './types'

// Auto-discover every concept spec next to the schema. New concept files drop in
// without touching this module. schema.json has no `concept` field, so it's filtered out.
const modules = import.meta.glob<{ default: unknown }>('./data/concepts/*.json', { eager: true })

// Concepts without an explicit `order` sort after every ordered one (then alphabetically).
const ORDER_LAST = Number.MAX_SAFE_INTEGER

export const concepts: ConceptSpec[] = Object.entries(modules)
  .filter(([path]) => !path.endsWith('schema.json'))
  .map(([, mod]) => mod.default as ConceptSpec)
  .filter((c): c is ConceptSpec => Boolean(c && (c as ConceptSpec).concept))
  .sort(
    (a, b) =>
      (a.order ?? ORDER_LAST) - (b.order ?? ORDER_LAST) || a.displayName.localeCompare(b.displayName),
  )

export function conceptBySlug(slug: string): ConceptSpec | undefined {
  return concepts.find((c) => c.concept === slug)
}

/** Concepts grouped by cluster, in canonical order. Clusters with no content don't appear. */
export const clusters: { cluster: Cluster; concepts: ConceptSpec[] }[] = CLUSTER_ORDER.map((cluster) => ({
  cluster,
  concepts: concepts.filter((c) => c.cluster === cluster),
})).filter((g) => g.concepts.length > 0)

/**
 * Project a concept's diagram into the LoopSpec shape LoopGraph renders.
 * `harness` doubles as the SVG marker namespace, so the concept slug keeps
 * marker ids unique when several diagrams are mounted at once.
 */
export function diagramSpec(c: ConceptSpec): LoopSpec | undefined {
  if (!c.diagram) return undefined
  return { harness: c.concept, displayName: c.displayName, nodes: c.diagram.nodes, edges: c.diagram.edges }
}

export function scenario(c: ConceptSpec, id: string): ConceptScenario | undefined {
  return c.scenarios?.find((s) => s.id === id)
}

/** Alphabetical projection over the loaded specs — drives the Glossary view. */
export const glossary: ConceptSpec[] = [...concepts].sort((a, b) =>
  a.displayName.localeCompare(b.displayName),
)
