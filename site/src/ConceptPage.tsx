import type { ConceptSpec } from './types'
import { conceptBySlug, diagramSpec } from './data'
import { Anchored } from './Anchored'
import { LoopGraph } from './LoopGraph'
import { ConceptPlayer } from './ConceptPlayer'

interface Props {
  spec: ConceptSpec
  /** Navigate to another concept (the "see also" chips). */
  onSelect: (slug: string) => void
}

/** A single concept: summary, prose sections, diagram/player, misconceptions, related, sources. */
export function ConceptPage({ spec, onSelect }: Props) {
  const dia = diagramSpec(spec)
  const hasScenarios = Boolean(spec.scenarios && spec.scenarios.length > 0)

  return (
    <article className="stack stack--lg concept-page">
      <header className="concept-head stack stack--sm">
        <div className="concept-title cluster">
          <h2>{spec.displayName}</h2>
          {spec.status === 'draft' && <span className="badge badge--ghost">draft</span>}
        </div>
        <p className="concept-tagline">
          <Anchored text={spec.tagline} />
        </p>
        <p className="concept-summary">
          <Anchored text={spec.summary} />
        </p>
      </header>

      {spec.sections?.map((s) => (
        <section key={s.heading} className="concept-section stack stack--sm">
          <h3>{s.heading}</h3>
          {s.body.map((para, i) => (
            <p key={i} className="concept-para">
              <Anchored text={para} />
            </p>
          ))}
        </section>
      ))}

      {/* Diagram with scenarios → full step-through player. Diagram alone → static graph. */}
      {dia && hasScenarios ? (
        <ConceptPlayer spec={spec} />
      ) : dia ? (
        <section className="stack stack--sm">
          <div className="card graph-pane">
            <LoopGraph spec={dia} />
          </div>
          {spec.diagram?.caption && (
            <p className="diagram-caption">
              <Anchored text={spec.diagram.caption} />
            </p>
          )}
        </section>
      ) : null}

      {spec.misconceptions && spec.misconceptions.length > 0 && (
        <section className="stack stack--sm">
          <h3>What catches people</h3>
          <div className="misconception-list">
            {spec.misconceptions.map((m, i) => (
              <div key={i} className="card misconception">
                <p className="misconception__myth">
                  <span className="misconception__label">Myth</span>
                  <Anchored text={m.myth} />
                </p>
                <p className="misconception__reality">
                  <span className="misconception__label misconception__label--reality">Reality</span>
                  <Anchored text={m.reality} />
                </p>
                {m.why && (
                  <p className="misconception__why">
                    <Anchored text={m.why} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {spec.related && spec.related.length > 0 && (
        <section className="stack stack--sm">
          <h3>See also</h3>
          <div className="see-also cluster">
            {spec.related.map((slug) => {
              const target = conceptBySlug(slug)
              if (!target) return null
              return (
                <button key={slug} type="button" className="btn btn--secondary see-also__chip" onClick={() => onSelect(slug)}>
                  {target.displayName}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {spec.sources && spec.sources.length > 0 && (
        <footer className="concept-sources">
          <span className="footer-label">Sources</span>
          <ul className="source-list">
            {spec.sources.map((s, i) => (
              <li key={i}>
                {s.ref && /^https?:\/\//.test(s.ref) ? (
                  <a className="repo-link" href={s.ref} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ) : (
                  <>
                    {s.label}
                    {s.ref && <code className="source-ref">{s.ref}</code>}
                  </>
                )}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  )
}
