#!/usr/bin/env node
// PreToolUse guard — deterministický guardrail (ne „prosba" v promptu).
// Chrání: vlastní hooky/settings, build výstupy, pracovní strom před scratch
// artefakty, a hlavně `main` — ta se pushem deployuje na GitHub Pages.
//
// Politika selhání: FAIL CLOSED — když guard neumí vstup přečíst, radši zablokuje.
// Únikový východ: spusť session s SENSEI_GUARD=off. Nastavit to může jen uživatel
// z terminálu — agent si env pro Write/Edit tooly nenastaví.
//
// Testy: node .claude/hooks/tests/run.mjs

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

if (process.env.SENSEI_GUARD === 'off') process.exit(0)

const block = (msg) => {
  process.stderr.write(`⛔ guard: ${msg}\n`)
  process.exit(2)
}

let payload
try {
  payload = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  block('nečitelný vstup hooku (fail-closed). Když je guard rozbitý, spusť session se SENSEI_GUARD=off a oprav .claude/hooks/guard.mjs.')
}

const tool = payload.tool_name ?? ''
const input = payload.tool_input ?? {}

// ─── Zápisy do souborů ───────────────────────────────────────────────────────
if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const raw = String(input.file_path ?? '')
  const p = raw.replaceAll('\\', '/')

  // 1. SEBEOCHRANA — model si nesmí oslabit vlastní pojistky
  if (/\.claude\/hooks\/[^/]+\.(mjs|js|sh)$/.test(p) || /\.claude\/settings(\.local)?\.json$/.test(p)) {
    block(`"${raw}" je guardrail (hook / settings). Model si vlastní pojistky přepisovat nesmí — uprav to ručně, nebo spusť session se SENSEI_GUARD=off.`)
  }

  // 2. Secrets
  if (/(^|\/)\.env($|\.)/.test(p) && !p.endsWith('.env.example')) {
    block(`zápis do "${raw}" — .env drží secrets a je gitignorovaný. Změnu si vyžádej od uživatele.`)
  }

  // 3. Build výstupy a závislosti (yarn build píše do build/ sám, přes Bash)
  if (/(^|\/)(build|node_modules|coverage|\.yarn)\//.test(p)) {
    block(`zápis do "${raw}" — build výstup / závislost. Uprav zdroj, ne artefakt.`)
  }

  // 4. Scratch artefakty v pracovním stromě
  if (/(^|\/)(screenshot|debug|scratch|tmp)[-_.][^/]*$/i.test(p)) {
    block(`"${raw}" je dočasný artefakt — nepatří do pracovního stromu. Použij scratchpad adresář session (mimo projekt).`)
  }
}

// ─── Shell příkazy ───────────────────────────────────────────────────────────
if (tool === 'Bash') {
  const cmd = String(input.command ?? '')

  if (/--no-verify\b/.test(cmd)) {
    block('`--no-verify` obchází kontroly, které jsou náš deterministický green-gate. Oprav příčinu, neobcházej ji.')
  }

  if (/\bgit\s+push\b[^|;&]*--force(?!-with-lease)\b/.test(cmd)) {
    block('`--force` přepíše historii natvrdo. Použij `--force-with-lease`.')
  }

  // main se pushem deployuje na GitHub Pages → commit i push na ni dělá jen uživatel
  const touchesMain = /\bgit\s+push\b[^|;&]*\b(main|HEAD:main|origin\s+main)\b/.test(cmd)
  const isCommit = /\bgit\s+commit\b/.test(cmd)
  const isPush = /\bgit\s+push\b/.test(cmd)

  if (isCommit || isPush) {
    let branch = ''
    try {
      branch = execFileSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
        encoding: 'utf8',
        timeout: 5_000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
    } catch {
      branch = '' // detached HEAD nebo mimo repo — nech projít, není to případ, který hlídáme
    }

    if (branch === 'main') {
      block(`jsi na "main" a ta se pushem deployuje na GitHub Pages. Založ feature branch pojmenovanou slugem ticketu (\`git switch -c <slug>\`).`)
    }
    if (touchesMain) {
      block('push do "main" spustí deploy na GitHub Pages. Merge do main dělá uživatel sám — pushni feature branch.')
    }
  }

  if (
    /\bgit\s+reset\s+--hard\b/.test(cmd) ||
    /\bgit\s+clean\s+-[a-zA-Z]*f/.test(cmd) ||
    /\bgit\s+checkout\s+--\s+\./.test(cmd)
  ) {
    block('destruktivní git zkratka by zahodila rozpracovanou práci. Vyřeš příčinu; když to fakt chceš, spusť to ručně.')
  }

  if (/\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?\s+(\/(\s|$)|~|\$HOME)/.test(cmd)) {
    block('rm -rf na kořenové/domovské cestě. Zamítnuto.')
  }
}

process.exit(0)
