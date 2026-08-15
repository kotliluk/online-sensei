#!/usr/bin/env node
// Fixture testy guardu. Spusť po KAŽDÉ změně hooku:
//
//     node .claude/hooks/tests/run.mjs
//
// Hooky jsou jediná deterministická pojistka autonomního úseku flow — regrese
// v jednom regexu buď zablokuje všechnu práci, nebo tiše pustí push na main.

import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const guard = path.join(here, '..', 'guard.mjs')
const repoRoot = path.resolve(here, '..', '..', '..')

const run = (stdin) =>
  spawnSync(process.execPath, [guard], {
    input: stdin,
    encoding: 'utf8',
    cwd: repoRoot,
    env: { ...process.env, SENSEI_GUARD: '' },
  })

const branch = spawnSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
  encoding: 'utf8',
  cwd: repoRoot,
}).stdout.trim()

const fixtures = JSON.parse(readFileSync(path.join(here, 'fixtures.json'), 'utf8'))

let failed = 0
let skipped = 0

for (const { name, expect, payload } of fixtures) {
  // Kontrola „jsi na main?" čte skutečnou HEAD, takže na main by tenhle případ
  // legitimně blokoval. Přeskoč ho a řekni to nahlas.
  const dependsOnBranch = payload.tool_name === 'Bash' && /\bgit\s+(commit|push)\b/.test(payload.tool_input?.command ?? '')
  if (dependsOnBranch && expect === 'allow' && branch === 'main') {
    console.log(`  ⏭  ${name} (přeskočeno — jsi na main)`)
    skipped++
    continue
  }

  const { status, stderr } = run(JSON.stringify(payload))
  const blocked = status === 2
  const ok = expect === 'block' ? blocked : !blocked

  if (ok) {
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✗ ${name} — čekal ${expect}, exit ${status}${stderr ? `: ${stderr.trim()}` : ''}`)
  }
}

// fail-closed: nečitelný vstup musí blokovat
{
  const { status } = run('{ not json')
  if (status === 2) {
    console.log('  ✓ fail-closed na nečitelném vstupu')
  } else {
    failed++
    console.log(`  ✗ fail-closed na nečitelném vstupu — exit ${status}, čekal 2`)
  }
}

// únikový východ musí fungovat
{
  const { status } = spawnSync(process.execPath, [guard], {
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git push origin main' } }),
    encoding: 'utf8',
    cwd: repoRoot,
    env: { ...process.env, SENSEI_GUARD: 'off' },
  })
  if (status === 0) {
    console.log('  ✓ SENSEI_GUARD=off vypne guard')
  } else {
    failed++
    console.log(`  ✗ SENSEI_GUARD=off nevypnul guard — exit ${status}`)
  }
}

const total = fixtures.length + 2 - skipped
console.log(failed ? `\n${failed} z ${total} selhalo\n` : `\n${total} testů prošlo\n`)
process.exit(failed ? 1 : 0)
