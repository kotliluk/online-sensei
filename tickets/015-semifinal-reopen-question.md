---
id: 015
slug: semifinal-reopen-question
title: Neptat se na repasáž, která neexistuje
status: review
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

- [x] Ve **čtyřčlenném** pavouku jde dokončené semifinále znovu otevřít **bez dialogu**,
      dokud není dohrané finále. Dnes se dialog ptá vždy.
- [x] Jakmile je ve čtyřčlenném pavouku **dohrané finále**, otevření semifinále se ptá —
      protože výsledek finále zůstane u závodníka, který se do něj už nemusí dostat.
      Text je ten obecný, ne ten o resetu repasáže.
- [x] V **osmičlenném** pavouku se otevření semifinále ptá dál a text říká, že repasáž
      bude resetována — protože tam opravdu bude.
- [x] Reopening repasážního zápasu i běžného zápasu s dohraným následníkem se chová
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

Branch: `semifinal-reopen-question` (navazuje na `tournament-tests`) · revieweři:
`correctness`, `tests`. Dva schválně — třicetiřádková změna doménového pravidla plus
volba textu; `react-state` ani `device-ux` by na ní neměly na čem pracovat.

**`correctness`: bez nálezů.** Udělal tabulku toho, co přesně se mění, a doložil, že
množina „ptá se" se **jen zmenšuje** — žádná nová otázka vzniknout nemůže. Prošel
`updateRepechageTree` a potvrdil, že neexistuje případ, kdy se přestane ptát a mělo by se.
Ověřil i indexaci `children[0]`/`[1]` proti `split` (levý pool je vždy ≥ pravý, takže
`children` je `[]`, `[left]` nebo `[left, right]`, nikdy jen `[right]`) a chování u lichých
pavouků 5–7 lidí, kde jedna půlka linku nepostaví.

**`tests`: jeden blocker a čtyři další.** Pustil 32 mutací.

**Opravit (90–100)**

- [blocker] `TreeTournamentScreen.tsx:47` · **rozhodnutí, kde všechna akceptační kritéria
  doopravdy platí, nehlídalo nic.** Tři mutace prošly celou sadou: předat `null` místo
  repasáže (v osmičlenném pavouku by se semifinále už nikdy nezeptalo), otočit podmínku,
  a smazat celou větev. Přežilo i `[tree, repechage]` → `[tree]`. → rozhodnutí vytaženo do
  čisté funkce `openFightAction(fight, tree, repechage): 'NOTHING' | 'OPEN' | 'ASK'`
  a otestováno jednotkově · **✅ opraveno**
- [blocker, druhá půlka] Vytažení samo o sobě nestačilo — drát mezi funkcí a obrazovkou
  pořád nikdo neověřoval a mutace „obrazovka repasáž nepředá" přežívala dál.
  → `TreeTournamentScreen.test.tsx` s **domockovaným `react-d3-tree`**: knihovna se nahradí
  seznamem tlačítek volajících tentýž `onNodeClick`, takže se testuje **vlastní drátování
  téhle obrazovky** (co předá pravidlu a co udělá s odpovědí), ne kreslení pavouka
  · **✅ opraveno**
- [major] `ReopenTreeFightModal.test.tsx` · dva testy se lišily jen tím, jestli vůbec nějaká
  repasáž je, takže jimi prošel každý predikát tvaru `isSemifinal && repechage !== null` —
  včetně `needsConfirmationToReopen`, což je **přesně ta chyba, kvůli které ticket vznikl**
  → přibyly dva případy: čtyřčlenný pavouk s dohraným finále, a osmičlenný s postavenou
  jen první linkou · **✅ opraveno**
- [major] `ReopenTreeFightModal.test.tsx` · první test neověřoval, že obecný text tam
  **není**, takže modál mohl vypsat oba odstavce pod sebou a sada zůstala zelená
  → obě větve v obou testech přes `saysSemifinal()` / `saysGeneral()` · **✅ opraveno**
- [minor] `ReopenTreeFightModal.tsx:25` · stráž `fight !== null`, kterou přidal tenhle diff,
  neověřoval nikdo · **✅ opraveno** (test, že to s nevybraným zápasem nespadne)
- [minor] `tournament.test.ts` · assert na finále byl vůči vlastní stráži tautologický —
  `if (isFinal(fight)) return false` jde smazat a test projde, protože pro finále vyjde
  `findParentFightFor` na `null` tak či tak · **✅ opraveno** (řečeno v komentáři; vstup,
  na kterém by se ty dvě cesty rozešly, neexistuje)
- [minor] `ReopenTreeFightModal.test.tsx` · `?? ''` v `body()` dělalo negativní asserty
  vakuově pravdivé · **✅ opraveno** (chybějící `.body` teď test shodí)

**Zvážit — nechal jsem na tobě**

- **`t.textRepechage` je nedosažitelná větev.** `needsConfirmationToReopen` vrací pro
  repasážní zápas vždy `false`, protože ten v hlavním stromě není a `findParentFightFor`
  nad ním nic nenajde. Dialog se tedy u repasáže nikdy neukáže a ten text nikdo neuvidí.
  Otázka je, jestli to je záměr (repasáž je poslední zápas své linie, není co ztratit) nebo
  díra (zápas pod kořenem linky vítěze posílá nahoru, takže **je** co ztratit). Preexistující,
  mimo diff — akceptační kritérium „repasážní zápas se chová jako dosud" je tím splněné,
  a je to teď řečeno nahlas v testu.
- **`isSemifinal` ve stráži `resetsRepechage` je ekvivalentní mutant** — odebrání projde
  celou sadou. Oba revieweři to nezávisle potvrdili a `correctness` k tomu dal důvod, proč
  to tam přesto nechat: kdyby někdo předal podstrom zakořeněný v semifinále, `repechageLineOf`
  by vrátilo `REPECHAGE_1` pro čtvrtfinále a funkce by lhala. `tests` doložil sondou pro
  pavouky 2–33, že při volání s kořenem se ty dvě verze nikdy nerozejdou.

## D — Hotovo

**Co se změnilo.** Otázka před znovuotevřením semifinále i text, který u ní stojí, se teď
obojí ptají na totéž: **existuje repasážní linka, kterou to resetuje?** Předtím jedna
rozhodovala podle `depth === 1` a druhý odpovídal podle `depth === 1`, a ani jedna se
nedívala na repasáž.

**Akceptační kritéria**

| # | Kritérium | Stav | Čím |
| - | --------- | ---- | ---- |
| 1 | Čtyřčlenný pavouk: semifinále bez dialogu, dokud není dohrané finále | ✅ | `resetsRepechage` + `openFightAction` v `types/tournament.ts` · `types/tests/` a `tournamentScreen/tests/TreeTournamentScreen.test.tsx` |
| 2 | Po dohraném finále se ptá, a to obecným textem | ✅ | `ReopenTreeFightModal.tsx:47` · `tests/ReopenTreeFightModal.test.tsx` |
| 3 | Osmičlenný pavouk se ptá dál, textem o resetu repasáže | ✅ | tamtéž · oba testové soubory |
| 4 | Repasážní zápas i zápas s dohraným následníkem beze změny | ✅ | `types/tests/tournament.test.ts` — a u repasáže i s poznámkou, **proč** je to triviálně splněné |

**Odchylky od zadání**

- **Přibylo vytažení `openFightAction`**, které v zadání nebylo. Vyžádalo si to review:
  bez něj bylo rozhodnutí zavřené v komponentě, kterou `react-d3-tree` v jsdomu nedovolí
  vykreslit, takže tři mutace v něm procházely zeleně.
- **Domockovaná knihovna pavouka.** Repo má precedent proti tomu
  (`TournamentScreen.test.tsx` říká, že shimnout rozměr by dokazovalo jen ten shim) — tady
  se ale nešimuje rozměr, aby se rozběhla cizí knihovna, nýbrž se **cizí knihovna nahradí
  celá** a testuje se vlastní drátování. Předpoklad, který ten mock nese, je tvar callbacku
  `onNodeClick({ data })`; kdyby ho knihovna změnila, test by to nechytil.
- **Znění obecného textu jsem nechal.** `text` zmiňuje repasáž taky, ale nic neslibuje —
  `correctness` to potvrdil jako obhajitelné: load-bearing půlka věty („následující zápasy")
  je pravdivá a půlka o repasáži prázdně pravdivá. Původní nález byl o **slibu akce**, která
  se nekoná; tenhle text žádný neslibuje.

**Gotchas pro příště**

- **Vytáhnout logiku z netestovatelné komponenty nestačí.** Zůstane drát mezi funkcí a
  komponentou, a ten drát je přesně to, co se při příští úpravě utrhne. Mutace „obrazávka
  stav nepředá" přežívala i po refaktoru, dokud se ta obrazovka nezačala renderovat.
- **`yarn typecheck | tail -1` schová nenulový exit kód.** Commitnul jsem s rozbitým
  typecheckem a všiml si toho až o krok dál. `set -e` proti tomu nepomůže — status roury
  je status posledního článku.

**Ověřeno na**

- **Testy:** 454 v 35 souborech, typecheck čistý, lint 61 warningů a 0 chyb — o jeden
  warning **míň** než `tournament-tests`, protože `handleClick` má teď kompletní deps.
- **Mutačně:** devět mutací pokrývajících obě obrazovky i obě čisté funkce, všechny
  zčervenaly. Pouštěno v kopii repa mimo pracovní strom, verdikt z návratového kódu.
- **Na telefonu neproběhlo.** Nemění se žádné API ani layout, jen jestli se modál ukáže,
  takže se nabízí jediná ruční zkouška: rozjet turnaj pro **čtyři** lidi, odehrát semifinále
  a kliknout na něj znovu — má se rovnou otevřít časomíra, bez otázky. Pak totéž s **osmi**,
  kde se otázka o repasáži ukázat má.

