import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AppShell, AppShellContent, Appbar, NavDrawer, SideNav, SideNavFooter, ThemeToggle, type SideNavGroup } from '@cameronsjo/artificer/react'
import { clusters, concepts, conceptBySlug } from './data'
import { CLUSTER_LABEL, KIND_COLOR, KIND_LABEL, type NodeKind } from './types'
import { ConceptIndex } from './ConceptIndex'
import { ConceptPage } from './ConceptPage'
import { Glossary } from './Glossary'

// Overview surfaces, then per-concept pages. nav holds either an overview id or a concept slug.
const OVERVIEW = [
  { id: 'index', label: 'Concepts' },
  { id: 'glossary', label: 'Glossary' },
] as const

// Wordmark shimmer: hue-cycles to run on load before settling into a glacial drift.
const WORDMARK_SHIMMER_LOOPS = 3

// Matches --bp-tablet (800px), which the Appbar/SideNav chrome components key
// their own hamburger/drawer takeover off of internally. Preserves the sticky
// top offset the hand-rolled `.app-sidenav` used to set directly.
const SIDENAV_STICKY_STYLE = { '--sidenav-sticky-top': 'calc(56px + var(--s-md))' } as CSSProperties

// Only the kinds the loaded specs actually use show up in the legend.
const usedKinds = (() => {
  const used = new Set<NodeKind>()
  for (const c of concepts) for (const n of c.diagram?.nodes ?? []) used.add(n.kind)
  return (Object.keys(KIND_COLOR) as NodeKind[]).filter((k) => used.has(k))
})()

export function App() {
  const [nav, setNav] = useState<string>('index') // overview id OR concept slug
  const [navOpen, setNavOpen] = useState(false) // mobile drawer

  const isOverview = OVERVIEW.some((o) => o.id === nav)
  const spec = isOverview ? undefined : conceptBySlug(nav)

  const selectNav = (id: string) => {
    setNav(id)
    setNavOpen(false)
    window.scrollTo({ top: 0 })
  }

  // The between-surface spine: overview surfaces, then concepts grouped by cluster.
  // SideNav owns the flat (desktop rail) / collapsible-sections (drawer) rendering
  // and, in `sections` mode, the whole open-state machine — this is only the
  // group/item DATA, shared by both SideNav instances below.
  const navGroups: SideNavGroup[] = [
    {
      key: 'overview',
      label: 'Overview',
      items: OVERVIEW.map((o) => ({ key: o.id, label: o.label, active: nav === o.id, onSelect: () => selectNav(o.id) })),
    },
    ...clusters.map((g) => ({
      key: g.cluster,
      label: CLUSTER_LABEL[g.cluster],
      items: g.concepts.map((c) => ({ key: c.concept, label: c.displayName, active: nav === c.concept, onSelect: () => selectNav(c.concept) })),
    })),
  ]

  // The persistent whimsy: the wordmark breathes the ultrathink shimmer for three
  // hue-cycles on load, then drifts glacially. Appbar is a plain function component
  // (no forwardRef), so there's no ref prop to reach its rendered `.wordmark` span —
  // query it by selector, scoped to the app root, once after mount.
  const appRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = appRef.current?.querySelector<HTMLElement>('.appbar__brand .wordmark') ?? null
    const cancel = window.Whimsy?.run(el, { loops: WORDMARK_SHIMMER_LOOPS, settle: 'glacial' })
    return () => cancel?.()
  }, [])

  // The icon script only hydrates `<i data-icon>` once on DOMContentLoaded, which
  // misses anything React mounts later (the hamburger, the drawer, sidenav rows).
  // observe() re-hydrates and watches for inserted nodes so those icons aren't blank.
  useEffect(() => window.ArtificerIcons?.observe(), [])

  // Same shape, same reason, for the colophon sign-off: Whimsy binds its
  // greeting on DOMContentLoaded, which fires before React mounts the footer,
  // so the element keeps its inline fallback text and never picks up the
  // seasonal swap or the glacial flow (upstream #325). observe() re-scans and
  // watches for inserted nodes.
  useEffect(() => window.Whimsy?.observe(document.body), [])

  return (
    <div className="app container container--lg surface-tool" ref={appRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Appbar
        brand="understanding claude code"
        brandHref="#main"
        brandWhimsy
        contained
        menu={{ controls: 'nav-drawer', open: navOpen, onClick: () => setNavOpen((open) => !open) }}
        actions={<ThemeToggle inline />}
      />

      <section className="intro stack stack--sm">
        <p className="lede t-body-lg">
          Claude Code, <b className="anchor">concept by concept</b> — the ideas that{' '}
          <b className="anchor">catch people</b>. What a <b className="anchor">fork</b> actually copies, how a{' '}
          <b className="anchor">subagent</b> differs, and why a Claude fork{' '}
          <b className="anchor">never touches your git branches</b>.
        </p>
        <div className="masthead-meta cluster" aria-label="About this build">
          <span className="badge badge--ghost">{concepts.length} concepts</span>
          <span className="badge badge--ghost">{clusters.length} cluster{clusters.length === 1 ? '' : 's'}</span>
          <span className="badge badge--ghost">interactive diagrams</span>
        </div>
      </section>

      <AppShell rail="230px" gap="var(--s-lg)">
        <SideNav groups={navGroups} sticky style={SIDENAV_STICKY_STYLE} />

        <AppShellContent id="main">
          {(nav === 'index' || spec?.diagram) && <Legend />}

          {concepts.length === 0 ? (
            <p className="empty">
              <b className="anchor">No concept specs found.</b> Add files under <code>src/data/concepts/</code>.
            </p>
          ) : nav === 'index' ? (
            <ConceptIndex onSelect={selectNav} />
          ) : nav === 'glossary' ? (
            <Glossary onSelect={selectNav} />
          ) : !spec ? (
            <p className="empty">
              <b className="anchor">Concept not found.</b>
            </p>
          ) : (
            <ConceptPage spec={spec} onSelect={selectNav} />
          )}
        </AppShellContent>
      </AppShell>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} id="nav-drawer">
        <SideNav groups={navGroups} sections footer={<SideNavFooter />} />
      </NavDrawer>

      {/* Colophon: three-zone Artificer shape — sourced/disclosure grid, identity spine, trademark fine print. */}
      <footer className="colophon">
        <div className="container">
          <div className="grid-auto">
            <section>
              <span className="colophon__label">Sourced</span>
              <p>
                <b className="anchor">Independent &amp; unofficial.</b> Concept explanations are derived from the
                public Claude Code documentation, observed tool behavior, and the sibling{' '}
                <a className="repo-link" href="https://cameronsjo.github.io/agentic-harnesses/" target="_blank" rel="noreferrer">
                  agentic-harnesses
                </a>{' '}
                source analysis. Claude Code moves fast — details can drift out of date; each concept cites its sources.
              </p>
            </section>
            <section>
              <span className="colophon__label">Disclosure</span>
              <p>
                Built with the{' '}
                <a className="repo-link" href="https://cameronsjo.github.io/artificer/" target="_blank" rel="noreferrer">
                  <b className="anchor">Artificer design system</b>
                </a>
                , React + Vite. Written by — and with — Claude Code itself, by a practitioner who got caught by these
                exact concepts. Spot an error?{' '}
                <a className="repo-link" href="https://github.com/cameronsjo/understanding-claude-code/issues" target="_blank" rel="noreferrer">
                  Open an issue
                </a>
                .
              </p>
            </section>
          </div>
          <div className="colophon__spine">
            <span>&copy; {new Date().getFullYear()} Cameron Sjo</span>
            <span data-whimsy-greeting data-whimsy-greeting-class="whimsy--glacial">
              kindness is a choice.
            </span>
            <nav className="cluster">
              <a className="repo-link" href="https://github.com/cameronsjo/understanding-claude-code/issues" target="_blank" rel="noreferrer">
                Open an issue
              </a>
            </nav>
          </div>
          <p className="colophon__fine">
            No affiliation with, sponsorship by, or endorsement from Anthropic. Claude and Claude Code are trademarks
            of Anthropic, PBC.
          </p>
        </div>
      </footer>
    </div>
  )
}

function Legend() {
  return (
    <div className="legend cluster" aria-label="Diagram node kinds">
      {usedKinds.map((k) => (
        <span key={k} className="legend-item">
          <span className="dot" style={{ background: KIND_COLOR[k] }} />
          <span className="t-label-sm">{KIND_LABEL[k]}</span>
        </span>
      ))}
    </div>
  )
}
