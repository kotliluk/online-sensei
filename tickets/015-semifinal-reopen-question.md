---
id: 015
slug: semifinal-reopen-question
title: Neptat se na repasáž, která neexistuje
status: wip
branch: semifinal-reopen-question
---

# Neptat se na repasáž, která neexistuje

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-26

Z review ticketu 008 (`correctness`, jistota 90). Uživatel rozhodl rovnou:

„čtyřčlenný pavouk klidně rovnou oprav / dalších sedm mutací nech být"

**Nález:** `needsConfirmationToReopen` vrací pro semifinále `true` **bezpodmínečně**
(`types/tournament.ts:377`) a `ReopenTreeFightModal` k tomu podle `depth === 1` vybere text
„Opravdu chcete otevřít dokončené semifinále? **Repasáž bude resetována.**"

Ve čtyřčlenném pavouku ale žádná repasáž nevzniká: `createRepechageLine` dostane jediného
soupeře a vrátí `null`, takže `updateRepechageTree` vrátí `null` taky. Dialog tedy slibuje,
že resetuje něco, co neexistuje — a to je přesně to učení lidí proklikávat dialogy, proti
kterému je ta funkce napsaná.

## B — Zadání

**Problém:** Otázka před znovuotevřením zápasu má smysl jen tam, kde je co ztratit. Ve
čtyřčlenném pavouku se ptá vždycky a mluví o repasáži, která nikdy nevznikne.

**Rozsah:** Navázat otázku i text na to, jestli **doopravdy existuje repasážní linka, která
se resetuje**. Zbytek pravidel (finále se neptá, zápas s dohraným následníkem se ptá)
zůstává, jak je.

**Mimo rozsah:**

- **Znění obecného textu.** `text` zmiňuje repasáž taky („Následující zápasy a repasáž
  nebudou automaticky aktualizovány"), a ve čtyřčlenném pavouku tam žádná není. Nic ale
  neslibuje — je to obecná opatrnost a pro neexistující repasáž vychází prázdně pravdivá.
  Nový překladový klíč do obou mutací kvůli tomu nedělám; kdyby to vadilo, je to jednořádek.
- Sedm mutací, které v ticketu 008 přežily — uživatel rozhodl nechat.
- Cokoli dalšího kolem repasáže.

**Akceptační kritéria:**

- [ ] Ve **čtyřčlenném** pavouku jde dokončené semifinále znovu otevřít **bez dialogu**,
      dokud není dohrané finále. Dnes se dialog ptá vždy.
- [ ] Jakmile je ve čtyřčlenném pavouku **dohrané finále**, otevření semifinále se ptá —
      protože výsledek finále zůstane u závodníka, který se do něj už nemusí dostat.
      Text je ten obecný, ne ten o resetu repasáže.
- [ ] V **osmičlenném** pavouku se otevření semifinále ptá dál a text říká, že repasáž
      bude resetována — protože tam opravdu bude.
- [ ] Reopening repasážního zápasu i běžného zápasu s dohraným následníkem se chová
      jako dosud.

**Technicky** (malá dráha, `C` se nepíše):

- Nová čistá funkce `resetsRepechage(fight, tree, repechage)` v `src/types/tournament.ts`
  vedle `isFinal`/`isSemifinal`: je to semifinále a **existuje linka odpovídajícího typu**
  (`REPECHAGE_1` pro `tree.children[0]`, `REPECHAGE_2` pro `children[1]`)?
- `needsConfirmationToReopen` dostane repasáž jako třetí parametr a bezpodmínečnou větev
  na semifinále nahradí tou funkcí; když nevyjde, propadne se na dosavadní kontrolu rodiče.
- `ReopenTreeFightModal` volí text podle té samé funkce, ne podle `depth === 1`. Repasáž
  a strom si vytáhne ze storu (`selectKumiteTimerRepechageTree`,
  `selectKumiteTimerTournamentTree`).
- `TreeTournamentScreen` už `repechage` v ruce má (`getTreeDepth(repechage)`), jen ho předá.
- Testy: `resetsRepechage` a `needsConfirmationToReopen` jednotkově v
  `src/types/tests/tournament.test.ts` — čtyřčlenný pavouk před finále i po něm,
  osmičlenný s repasáží. Pavouky se tam píšou ručně, protože uuid modul je v tom souboru
  namockovaný na konstantu.
- **Čím to může selhat na zařízení:** ničím novým — mění se, jestli se ukáže modál, ne jak.
  Žádné nové API, žádný nový text, žádný layout.

## Review

<!-- doplní /ticket-review -->
