import { glossary } from './data'
import { CLUSTER_LABEL } from './types'
import { Anchored } from './Anchored'

interface Props {
  onSelect: (slug: string) => void
}

/** Alphabetical projector over the loaded specs — every term links into its concept page. */
export function Glossary({ onSelect }: Props) {
  return (
    <div className="stack stack--md">
      <p className="view-foot">
        Every term, alphabetically. Each links to its full concept page.
      </p>
      <dl className="glossary">
        {glossary.map((c) => (
          <div key={c.concept} className="glossary-row">
            <dt>
              <button type="button" className="glossary-term" onClick={() => onSelect(c.concept)}>
                {c.displayName}
              </button>
              <span className="glossary-cluster">{CLUSTER_LABEL[c.cluster]}</span>
            </dt>
            <dd>
              <Anchored text={c.tagline} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
