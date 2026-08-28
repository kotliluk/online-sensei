---
name: ticket-implementace
description: Fáze 3 flow Online Sensei — založí feature branch a naimplementuje ticket adaptivním TDD podle schváleného plánu testů, reuse-first, s průběžnými commity v prozaickém stylu tohoto repa. Použij po schválení zadání/analýzy.
effort: high
---

# Fáze 3 — Implementace

**Předpoklad — ověř na disku, nespoléhej na kontext:** `tickets/<id>-<slug>.md` má ve frontmatteru
**`status: approved`**. To je jediný důkaz, že gate proběhl. Když status není `approved`,
**zeptej se uživatele**, i kdyby ti kontext session tvrdil, že schválení padlo.
**Nikdy nezačínej kódit bez schválení.**

## Krok 1 — Branch

```bash
git branch --show-current      # jsi na main? → MUSÍŠ založit branch
```

Branch se jmenuje **slugem ticketu** (`fight-log`) — bez `feat/` prefixu, tak vypadají
branche v tomhle repu. Když už existuje, **navaž na ni**. Na `main` se necommituje.

## Krok 2 — Adaptivní TDD

Cíl = **„Plán testů"** z ticketu. Vždy skonči cyklem **red → green**.

- **Bugfix:** nejdřív **padající reprodukční test** (potvrď, že fakt padá), pak oprav.
- **Feature:** testy piš nejdřív tam, kde je kontrakt jasný (čistá funkce, reducer, selektor,
  parsování URL). U obrazovek udělej tenký řez a **hned ho zamkni testem** přes Testing Library.
- **Co se testem chytit nedá** (chování `navigator.share`, autoplay, Safari a bloby)
  netestuj přes mock, který jen zopakuje tvůj předpoklad — takový test kupuje falešnou
  jistotu. Zapiš to místo toho do „Ověřeno na" jako věc k ruční zkoušce.
- Konvence testů (`tests/` podadresář, `globals: true`, `// act` / `// assert`, `test.each`,
  fake timers) drží `CLAUDE.md`.

## Krok 3 — Reuse first

**Drž vzor vybraný v analýze.** Žebřík z `CLAUDE.md` už proběhl, tady se rozhodnutí
neotevírá znovu — jen dodržuje. Narazíš-li na kód, který analýza nepokryla, projdi žebřík
na místě a **výsledek dopiš do „Předpoklady"**.

Dvě věci, na které se v tomhle repu zapomíná pokaždé:

- **Každý nový uživatelský text do `cs.ts` i `en.ts`.** Jinak neprojde typecheck — a když
  projde, chybí česky.
- **Nepřidávej nové `react-hooks` warningy.** Preexistujících je ~74 a cílem je nezhoršit
  to; nový warning v diffu je nález, ne pozadí.

## Krok 4 — Commity

Průběžně, ne jeden balvan na konci. **Formát drží `CLAUDE.md` → „Commit messages"**:
titulek jako věta v přítomném čase, tělo próza vysvětlující **proč** — co se měřilo, proč
zvolená varianta a ne ta zřejmá. Než napíšeš první, přečti si posledních pět commitů.

- Nikdy `--no-verify`.
- **Na `main` necommituj a nepushuj.** `guard.mjs` to zablokuje, ale vědět to máš i bez něj.

## Krok 5 — Push a draft PR

Jakmile je první commit hotový, **pushni branch a založ draft PR**. Ne na konci fáze — hned,
jak je co pushnout: review se dělá na GitHubu, takže PR je místo, kam se práce průběžně
skládá, ne odměna na konci.

```bash
git push -u origin <slug>
gh pr create --draft --base main --head <slug> --title "<věta v přítomném čase>" --body-file <soubor>
```

- **Titulek je věta v přítomném čase**, stejně jako commit — a **anglicky**, jako commity.
- **Tělo anglicky**, próza a tabulky, ne odrážkový výčet diffu. Formát drží
  `CLAUDE.md` → „Commit messages": vysvětluj **proč**, ne co je v diffu vidět. První řádek
  odkazuje na ticket: `Ticket [010](tickets/010-cleanup.md) — <jedna věta>`.
  **Než napíšeš první, přečti si poslední dva mergnuté PR** (`gh pr list --state merged`,
  `gh pr view <n> --json title,body`).
- Draft, dokud neproběhne review — fáze 5 ho překlopí na ready.
- Další commity fází 4 a 5 se do PR jen dopushují, nový PR se nezakládá.

## Nejasnosti

- **Tvrdý blok** (špatné rozhodnutí = přepsat velkou část práce) → zastav a zeptej se.
- **Drobná nejasnost** → pokračuj s **explicitním předpokladem** zapsaným do „Předpoklady".
- **Ticket roste nad rámec zadání** → řekni to hned. Rozdělit ho je levnější než dodělat.

## Konec

Nastav `status: wip`. Vypiš URL draft PR. Pokračuj fází 4 — `ticket-validace`.
