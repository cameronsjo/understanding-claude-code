import { clusters } from './data'
import { CLUSTER_LABEL } from './types'
import { Anchored } from './Anchored'

interface Props {
  onSelect: (slug: string) => void
}

/** The default view: concept cards grouped by cluster. */
export function ConceptIndex({ onSelect }: Props) {
  return (
    <div className="stack stack--lg">
      {clusters.map((g) => (
        <section key={g.cluster} className="stack stack--sm">
          <h2 className="cluster-head">{CLUSTER_LABEL[g.cluster]}</h2>
          <div className="concept-grid">
            {g.concepts.map((c) => (
              <button
                key={c.concept}
                type="button"
                className="card concept-card"
                onClick={() => onSelect(c.concept)}
              >
                <span className="concept-card__head">
                  <b className="concept-card__name">{c.displayName}</b>
                  {c.status === 'draft' && <span className="badge badge--ghost">draft</span>}
                </span>
                <span className="concept-card__tagline">
                  <Anchored text={c.tagline} />
                </span>
                <span className="concept-card__meta">
                  {c.diagram && <span className="badge badge--ghost">diagram</span>}
                  {c.scenarios && (
                    <span className="badge badge--ghost">
                      {c.scenarios.length} scenario{c.scenarios.length === 1 ? '' : 's'}
                    </span>
                  )}
                  {c.misconceptions && (
                    <span className="badge badge--ghost">
                      {c.misconceptions.length} misconception{c.misconceptions.length === 1 ? '' : 's'}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
