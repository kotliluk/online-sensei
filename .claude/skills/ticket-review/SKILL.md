---
name: ticket-review
description: Fáze 5 flow Online Sensei — paralelní review subagenti (korektnost, React a stav, chování na zařízeních, testy) zhodnotí diff, syntéza do sekce Review v ticketu s confidence buckety a auto-fix jistých nálezů. Použij po validaci, před předáním k finálnímu review.
---

# Fáze 5 — Code review

Cíl: **nezávislý vícestranný pohled na diff**, než ho uvidí uživatel.

## Optiky

| Agent                   | Zaměření                                                            | Pouštěj, když diff…                          |
| ----------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| `correctness-reviewer`  | dělá to, co má? logika, reducery, selektory, hraniční stavy          | **vždy**                                       |
| `tests-reviewer`        | kritik testů (mutační myšlení), ne pisatel testů                     | **vždy**, když se mění logika nebo chování     |
| `react-state-reviewer`  | hooky, efekty, cleanup, vlastnictví stavu, stale closures            | sahá na `src/components/`, `src/pages/`, hooky |
| `device-ux-reviewer`    | prohlížečová API, telefony, i18n, layout, přístupnost                | sahá na `navigator.*`, audio, soubory, routing, SCSS, texty |

**Neposílej všechny čtyři na každý diff.** Na padesátiřádkovou opravu utility jsou dva
agenti víc než dost; čtyři by vyrobili šum a tři čtvrtiny by hlásily „bez nálezů".
Vyber podle tabulky a **napiš, kteří běželi a proč zrovna ti**.

> **Proč tu není style-reviewer:** style deterministicky řeší `eslint --fix` v PostToolUse
> hooku. Reviewer na style by jen duplikoval linter.
>
> **Proč tu není security a performance:** appka nemá backend, DB ani přihlášení —
> N+1 ani multi-tenant izolace tu neexistují. Robustnost vstupů z URL a `localStorage`
> (jediná reálná „nedůvěryhodná" data) hlídá `correctness-reviewer`, výkon renderu
> `react-state-reviewer`. Ty dva sloty jsou tady užitečnější na React a na zařízení —
> odtud pochází většina skutečných chyb tohohle repa.

## Krok 1 — Kontext

```bash
git branch --show-current
git diff main...HEAD --stat
git diff main...HEAD
```

Načti z `tickets/<id>-<slug>.md` **akceptační kritéria**, **plán testů** a **Předpoklady** —
to je měřítko, proti kterému se reviewuje.

## Krok 2 — Spusť agenty PARALELNĚ

Revieweři jsou bundlovaní v `agents/*.md`. Spusť vybrané **v jedné zprávě** jako
`subagent_type: "general-purpose"` a každému do promptu vlož:

1. **celý kontrakt** — tělo `agents/<name>.md` včetně výstupního formátu,
2. explicitní **READ-ONLY** instrukci (reviewer čte a hlásí, needituje),
3. `git diff main...HEAD`,
4. akceptační kritéria + Předpoklady z ticketu,
5. 2–3 věty shrnutí zadání.

> **Proč `general-purpose` s vloženým kontraktem, a ne `subagent_type: "<jméno>"`:**
> tihle agenti jsou bundlovaní u skillu, ne registrovaní jako spawnovatelné typy —
> pojmenovaný typ v dané session nemusí existovat. Vložený kontrakt funguje všude.

**Šestá optika jiným modelem** (`/kimi:review`) je tady **opt-in** — spusť ji, jen když
o to uživatel řekne (`/ticket-review kimi`) nebo když je diff nezvykle velký. Na
stořádkovou iteraci je půlhodinový cross-model průchod dražší než užitečnější. Když běží,
pouštěj ho **detachovaně na pozadí** (foreground Bash má strop 10 minut, Kimi 30) a jeho
nálezy proženeš stejnou syntézou.

## Krok 3 — Syntéza → sekce `Review`

Bez tohohle kroku si agenti protiřečí a auto-fix aplikuje protichůdné patche.

**Dedup:** stejné místo + stejná příčina = **jeden** nález, přiřazený tomu, kdo má
**nejkonkrétnější důkaz** (ne nejdelší text).

**Buckety** — každý agent posílá jistotu 80–100:

| Jistota    | Kam to jde                                                     |
| ---------- | --------------------------------------------------------------- |
| **90–100** | **Opravit** — auto-fix                                           |
| **80–89**  | **Zvážit** — do ticketu, rozhodne uživatel                       |
| **< 80**   | **Zahodit** — agent to neměl posílat; nedávej to do reportu      |

**Precedence při sporu:** vstupy a hraniční stavy → `correctness`; efekty, cleanup
a vlastnictví stavu → `react-state`; chování na zařízení a texty → `device-ux`; kvalita
testů → `tests`.

**Nikdy nepředkládej dva protichůdné fixy na stejné řádky, aniž řekneš, který platí.**

Zapiš do sekce `Review` ticketu — **jedna odrážka na nález**, ne odstavec:

```markdown
## Review

Branch: `<branch>` · revieweři: <kdo běžel>

**Opravit (90–100)**

- [blocker|major|minor] `path:line` · <problém> → <oprava> · **✅ opraveno** / **⏸ nechal jsem na tebe** (proč)

**Zvážit (80–89)**

- `path:line` · <nález a proč si nejsem jistý>

**Bez nálezů:** <kteří revieweři nic nenašli>
```

## Krok 4 — Auto-fix

- **90–100 + jednoznačná oprava** → **oprav.**
- **80–89, cokoli nejistého, nebo produktové rozhodnutí** → **NEOPRAVUJ.** Nech v ticketu
  a explicitně zmiň uživateli. Automatická „oprava" produktového rozhodnutí je horší než
  nález.

Po fixech spusť **znovu `ticket-validace`** — fix bez zelených testů není fix.

Pak **pushni** a **překlop draft PR na ready** (`gh pr ready`). PR, který nemá review fixy,
je PR, nad kterým uživatel reviewuje něco jiného, než co je na branchi. Do popisu PR přidej
sekci o tom, **co review našlo, co se opravilo a co zůstalo** — to je ta část, kterou
reviewer na GitHubu potřebuje nejdřív.

## Krok 5 — Anti-busywork

Když není co opravit, napiš **„Bez nálezů"** a skonči. **Nevymýšlej si práci**, nerefaktoruj
okolní kód, nepřidávej abstrakce do zásoby. Prázdný review je legitimní výsledek — na
stořádkové iteraci dokonce ten očekávaný.
