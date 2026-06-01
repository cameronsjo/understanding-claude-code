import { useEffect, useRef, useState } from 'react'
import type { ConceptSpec } from './types'
import { KIND_LABEL } from './types'
import { diagramSpec, scenario } from './data'
import { Anchored } from './Anchored'
import { LoopGraph } from './LoopGraph'
import { GraphModal } from './GraphModal'
import { edgeBetween, usePlayerTimer } from './player'
import { ExpandButton, TabPicker, TransportBar } from './controls'

interface Props {
  spec: ConceptSpec
}

// One-shot shimmer duration for the "walkthrough complete" caption (ms).
const CELEBRATE_MS = 2200

/**
 * Step-through player for a concept's diagram + scenarios. Adapted from the
 * sibling repos' LoopPlayer; scenario ids are concept-local, so the picker
 * state lives here rather than being lifted to App.
 */
export function ConceptPlayer({ spec }: Props) {
  const dia = diagramSpec(spec)
  const scenarios = spec.scenarios ?? []
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? '')

  // Switching concepts remounts via key in ConceptPage? No — same component instance
  // can receive a new spec, so re-seed the scenario when the concept changes.
  useEffect(() => {
    setScenarioId(scenarios[0]?.id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.concept])

  const sc = scenario(spec, scenarioId) ?? scenarios[0]
  const player = usePlayerTimer(sc?.steps.length ?? 0, `${spec.concept}:${scenarioId}`)
  const { step, playing, atEnd } = player
  const [expanded, setExpanded] = useState(false)

  // The "complete" caption and the play→end latch (see the effects below).
  const captionRef = useRef<HTMLSpanElement>(null)
  const wasPlaying = useRef(false)

  // The one whimsical operation: reaching the final step IS the walkthrough ending.
  // Shimmer the caption once, but only when playback drove us to the end — not
  // on a manual Step/Reset.
  useEffect(() => {
    if (playing) wasPlaying.current = true
  }, [playing])
  useEffect(() => {
    if (atEnd && wasPlaying.current) {
      wasPlaying.current = false
      window.Whimsy?.celebrate(captionRef.current, CELEBRATE_MS)
    }
  }, [atEnd])

  if (!dia || !sc) return null

  const activeNodeId = sc.steps[step]
  const activeEdge = edgeBetween(sc.steps[step - 1], sc.steps[step])
  const node = dia.nodes.find((n) => n.id === activeNodeId)

  // Reused inline and in the expand modal — the scenario header (picker + title),
  // the diagram, and the live node card.
  const scenarioHeader = (
    <>
      <TabPicker
        ariaLabel="Scenarios"
        items={scenarios.map((s) => ({ id: s.id, label: s.id }))}
        active={scenarioId}
        onSelect={setScenarioId}
      />
      <p className="scenario-title">
        <Anchored text={sc.title} />
      </p>
    </>
  )
  const graph = <LoopGraph spec={dia} activeNodeId={activeNodeId} activeEdge={activeEdge} />
  const nodeCard = node && (
    <div className="card card--active node-card">
      <div className="node-card-head">
        <span className={`dot dot--${dotFor(node.kind)}`} />
        <b>{node.label}</b>
      </div>
      <div className="node-kind">{KIND_LABEL[node.kind]}</div>
      {node.note && (
        <p className="node-note">
          <Anchored text={node.note} />
        </p>
      )}
    </div>
  )

  return (
    <div className="player">
      {scenarioHeader}

      <div className="player-body">
        <div className="card graph-pane">
          <ExpandButton onClick={() => setExpanded(true)} />
          {graph}
        </div>

        <aside className="inspector">
          <TransportBar player={player} playLabel="Play" />

          <div className="step-counter">
            step <b>{step + 1}</b> / {sc.steps.length}
            {atEnd && (
              <span className="turn-complete" ref={captionRef}>
                walkthrough complete
              </span>
            )}
          </div>

          {nodeCard}

          {sc.note && (
            <p className="scenario-note">
              <Anchored text={sc.note} />
            </p>
          )}
        </aside>
      </div>

      {spec.diagram?.caption && (
        <p className="diagram-caption">
          <Anchored text={spec.diagram.caption} />
        </p>
      )}

      <GraphModal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={spec.displayName}
        diagram={graph}
        side={
          <>
            {scenarioHeader}
            <TransportBar player={player} playLabel="Play" total={sc.steps.length} counterLabel="step" />
            {nodeCard}
          </>
        }
      />
    </div>
  )
}

// Map node kinds onto the Artificer status-dot variants that exist in the CSS.
function dotFor(kind: string): string {
  switch (kind) {
    case 'decision':
      return 'urgent'
    case 'tool':
      return 'attention'
    case 'git':
      return 'success'
    default:
      return 'accent'
  }
}
