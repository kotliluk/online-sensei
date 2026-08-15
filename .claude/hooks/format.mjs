#!/usr/bin/env node
// PostToolUse formatter — `eslint --fix` na právě změněný soubor.
//
// Tenhle repo NEMÁ prettier; formátování drží @stylistic pravidla v eslint.config.js,
// takže `eslint --fix` je celý formátovací krok. Proto se pouští jen na .ts/.tsx/.js/.mjs —
// na .scss, .md ani .json by neměl co dělat.
//
// Dvě zásady:
//   • FAIL OPEN  — formátování nikdy neblokuje práci.
//   • TICHO PŘI ÚSPĚCHU — cokoli na stdout by stálo kontext u KAŽDÉ editace.
//
// Typecheck a testy sem NEPATŘÍ (zdražily by každou editaci) — od toho je `ticket-validace`.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

if (!['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(payload.tool_name ?? '')) process.exit(0)

const file = payload.tool_input?.file_path
if (!file) process.exit(0)

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

const rel = path.relative(root, path.resolve(file))
if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) process.exit(0) // mimo repo

// Pouštíme přímo JS entrypoint přes `node`, ne `node_modules/.bin/eslint`: ten je jen
// symlink na skript se shebangem a v git worktree (kde je celý node_modules symlink na
// hlavní checkout) se přes něj exec nemusí povést. Tudy to nezávisí ani na exec bitu.
const cli = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js')
if (!existsSync(cli)) process.exit(0) // toolchain ještě není nainstalovaný

if (!['.ts', '.tsx', '.js', '.mjs'].includes(path.extname(file))) process.exit(0)

try {
  execFileSync(process.execPath, [cli, '--fix', file], { cwd: root, stdio: 'ignore', timeout: 30_000 })
} catch {
  /* fail open — lint chyby řeší `ticket-validace`, formátování nikdy neblokuje editaci */
}

process.exit(0)
