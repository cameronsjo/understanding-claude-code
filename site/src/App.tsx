import { useEffect, useRef, useState } from 'react'
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

  // The persistent whimsy: the wordmark breathes the ultrathink shimmer for three
  // hue-cycles on load, then drifts glacially. React mounts after DOMContentLoaded.
  const titleRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const cancel = window.Whimsy?.run(titleRef.current, { loops: WORDMARK_SHIMMER_LOOPS, settle: 'glacial' })
    return () => cancel?.()
  }, [])

  // The icon script only hydrates `<i data-icon>` once on DOMContentLoaded, which
  // misses anything React mounts later (the hamburger, the drawer). observe()
  // re-hydrates and watches for inserted nodes so those icons aren't blank.
  useEffect(() => window.ArtificerIcons?.observe(), [])

  // Mobile drawer focus management — inert when closed, focus-trapped when open.
  const drawerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    if (!navOpen) {
      el.setAttribute('inert', '')
      return
    }
    el.removeAttribute('inert')
    const handle = window.ArtificerFocus?.trap(el, { onEscape: () => setNavOpen(false) })
    return () => handle?.release()
  }, [navOpen])

  return (
    <div className="app container container--lg surface-tool" data-nav-open={navOpen ? '' : undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="appbar">
        <button
          type="button"
          className="btn btn--ghost btn--icon appbar__menu-btn"
          aria-label="Open navigation"
          aria-expanded={navOpen}
          aria-controls="nav-drawer"
          onClick={() => setNavOpen(true)}
        >
          <i data-icon="menu" data-icon-size="32" />
        </button>
        {/* `wordmark` lives on the inline text span, NOT the .appbar__brand flex
            container — its ::after accent period would otherwise become a flex item
            and the container `gap` would detach it ("word ." not "word."). See
            cameronsjo/artificer-design-system#81. */}
        <a className="appbar__brand" href="#main">
          <span className="wordmark whimsy" ref={titleRef}>
            understanding claude code
          </span>
        </a>
        <span className="appbar__spacer" />
        <div className="appbar__actions">
          <ThemeToggle />
        </div>
      </header>

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

      <div className="app-shell">
        <aside className="app-sidenav">
          <ConceptNav nav={nav} onSelect={selectNav} />
        </aside>

        <main id="main" className="stack stack--lg">
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
        </main>
      </div>

      {/* Mobile drawer: scrim + off-canvas sidenav. data-nav-open on .app drives both. */}
      <div className="nav-scrim" onClick={() => setNavOpen(false)} />
      <aside id="nav-drawer" className="nav-drawer" aria-hidden={!navOpen} ref={drawerRef}>
        <ConceptNav nav={nav} onSelect={selectNav} />
      </aside>

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

/**
 * The between-surface spine: overview surfaces, then concepts grouped by cluster.
 * These switch app state rather than navigate, so they're <button>s — styles.css
 * carries a `.sidenav button` shim matching Artificer's `.sidenav a` grammar.
 */
function ConceptNav({ nav, onSelect }: { nav: string; onSelect: (id: string) => void }) {
  return (
    <nav className="sidenav" aria-label="Views and concepts">
      <div className="sidenav__group">Overview</div>
      {OVERVIEW.map((o) => (
        <button key={o.id} type="button" aria-current={nav === o.id ? 'page' : undefined} onClick={() => onSelect(o.id)}>
          <span className="label">{o.label}</span>
        </button>
      ))}

      {clusters.map((g) => (
        <div key={g.cluster} className="sidenav__cluster">
          <div className="sidenav__group">{CLUSTER_LABEL[g.cluster]}</div>
          {g.concepts.map((c) => (
            <button
              key={c.concept}
              type="button"
              aria-current={nav === c.concept ? 'page' : undefined}
              onClick={() => onSelect(c.concept)}
            >
              <span className="label">{c.displayName}</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  )
}

const THEME_KEY = 'artificer.theme'

function readTheme(): 'light' | 'dark' {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/**
 * Owns the theme toggle in React. The vendored artificer-theme.js binds on
 * DOMContentLoaded — before this SPA mounts — so its click handler never attaches.
 * We drive the same `data-theme` attribute + `artificer.theme` key here.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(readTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // localStorage unavailable (private mode etc.) — theme still applies for the session.
    }
  }, [theme])

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light or dark theme"
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
    >
      <span className="dot" />
      <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
    </button>
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
