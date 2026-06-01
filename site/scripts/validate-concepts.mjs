// Validates every concept spec against schema.json and enforces cross-concept invariants.
// Run via `npm run validate` (also wired into `npm run build`).
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv/dist/2020.js'

const here = dirname(fileURLToPath(import.meta.url))
const conceptsDir = join(here, '..', 'src', 'data', 'concepts')

const schema = JSON.parse(readFileSync(join(conceptsDir, 'schema.json'), 'utf8'))
const ajv = new Ajv({ allErrors: true, strict: false })
const validate = ajv.compile(schema)

const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.json') && f !== 'schema.json')
const slugs = new Set(files.map((f) => f.replace(/\.json$/, '')))

let anyFailed = false

for (const file of files) {
  const spec = JSON.parse(readFileSync(join(conceptsDir, file), 'utf8'))

  // Per-file error isolation: one bad spec must not suppress another spec's report.
  const errors = []

  if (!validate(spec)) {
    for (const err of validate.errors) errors.push(`schema: ${err.instancePath || '/'} ${err.message}`)
  } else {
    // Filename must match the slug.
    if (`${spec.concept}.json` !== file) {
      errors.push(`filename does not match concept slug "${spec.concept}"`)
    }

    // Diagram invariants: unique node ids; every edge endpoint references a declared node.
    const nodeIds = new Set()
    if (spec.diagram) {
      for (const n of spec.diagram.nodes) {
        if (nodeIds.has(n.id)) errors.push(`duplicate node id "${n.id}" in diagram`)
        nodeIds.add(n.id)
      }
      for (const e of spec.diagram.edges) {
        for (const end of [e.from, e.to]) {
          if (!nodeIds.has(end)) errors.push(`edge references unknown node id "${end}"`)
        }
      }
    }

    // Scenarios require a diagram, and every step must reference a declared node.
    if (spec.scenarios) {
      if (!spec.diagram) {
        errors.push('scenarios defined without a diagram to step through')
      } else {
        for (const s of spec.scenarios) {
          for (const step of s.steps) {
            if (!nodeIds.has(step)) errors.push(`scenario "${s.id}" step references unknown node id "${step}"`)
          }
        }
      }
    }

    // Related slugs must resolve to real spec files.
    for (const slug of spec.related ?? []) {
      if (!slugs.has(slug)) errors.push(`related[] slug "${slug}" does not resolve to a concept file`)
    }
  }

  if (errors.length > 0) {
    anyFailed = true
    console.error(`✗ ${file}`)
    for (const e of errors) console.error(`    ${e}`)
    continue
  }

  const shape = [
    spec.sections ? `${spec.sections.length} sections` : null,
    spec.diagram ? `${spec.diagram.nodes.length} nodes` : null,
    spec.scenarios ? `${spec.scenarios.length} scenarios` : null,
    spec.misconceptions ? `${spec.misconceptions.length} misconceptions` : null,
  ]
    .filter(Boolean)
    .join(', ')
  console.log(`✓ ${file} — ${spec.cluster}: ${shape || 'prose only'}`)
}

if (anyFailed) {
  console.error('\nConcept validation FAILED.')
  process.exit(1)
}
console.log(`\nConcept validation passed (${files.length} spec${files.length === 1 ? '' : 's'}).`)
