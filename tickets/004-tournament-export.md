---
id: 004
slug: tournament-export
title: Export celého turnaje
status: review
branch: tournament-export
---

# Export celého turnaje

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-16

Třetí fáze záměru z [ticketu 001](./001-fight-log.md), doslova:

„pokračuj stažením CSV o celém turnaji

- test na mobilu udělám až potom
- asi dává smysl u turnajů stáhnout 2 soubory — jeden je concatened logs ze všech zápasů
  a druhý je „grafická" podoba turnaje — u turnaje stylem „skupina" je to jasné, u turnaje
  „tree" to můžeme taky zkusit, ale asi to bude složitější
- respektive stažení „grafického" přehledu turnaje by šlo jako stažení obrázku zobrazené
  tabulky nebo pavouka"

## B — Zadání

**Problém:** Turnaj se dnes ze zařízení nedostane. Zápas po zápase ano — od
[ticketu 002](./002-fight-export.md) —, jenže na turnaji se exportuje po posledním zápase,
ne po každém, a to už je časomíra dávno zavřená. Kdo chce výsledky odeslat nebo archivovat,
opisuje je z displeje.

**Rozsah:** Na turnajové obrazovce (`TournamentScreen`) přibudou **dvě stažení**, každé svým
tlačítkem — dva soubory, ne jeden se dvěma listy, protože CSV listy nemá:

- **Průběh** — konkatenace logů všech odehraných zápasů. Přesně ty sloupce, co má export
  jednoho zápasu, jedna hlavička na celý soubor. Otevřený vedle sebe se soubor jednoho
  zápasu a soubor turnaje musí chovat stejně; to byl důvod, proč je formát z ticketu 002
  plochý.
- **Přehled** — turnaj tak, jak je vidět na obrazovce. **Tvar se řídí systémem, protože
  data mají u každého jiný tvar:**
  - **skupina** → křížová tabulka: první řádek i první sloupec jména, v buňkách `x:y`,
    napravo dopočtené sloupce V / R / P / + / − / +− stejně jako na obrazovce;
  - **pavouk** → jeden řádek na zápas, sloupec s kolem (finále, semifinále, …, repasáž),
    oba závodníci, skóre, vítěz.

Pořadí v souboru s průběhem je **chronologické podle první zaznamenané události** — soubor
je log, tak ať se čte, jak se to stalo, ne jak to leží v tabulce.

**Mimo rozsah:**

- **Obrázek** tabulky nebo pavouka. Viz otevřená otázka níž — je to jiná technika (canvas,
  PNG, sdílení obrázku) a patří do vlastního ticketu.
- Změna formátu exportu jednoho zápasu. Sloupce zůstávají; mění se jen to, že se hlavička
  odděluje od řádků, aby šly použít dvakrát.
- Vítěz v logu. Zůstává odloženo — volba vítěze žije v modálu za časomírou a do logu se
  nedostane, dokud se nepřesune (backlog).
- Export rozehraného turnaje z jiného zařízení, sdílení mezi zařízeními, tisk.

**Akceptační kritéria:**

- [ ] Na turnajové obrazovce jsou dvě tlačítka ke stažení, popisek se řídí tím, jestli
      zařízení soubor sdílí, nebo stahuje (jako v ticketu 002).
- [ ] Soubor s průběhem má jednu hlavičku a pak řádek na každou zaznamenanou událost
      každého odehraného zápasu; sloupce jsou shodné s exportem jednoho zápasu.
- [ ] **Skupina: každý zápas v souboru právě jednou.** Tabulka drží každý zápas dvakrát
      (`fights[i][j]` a zrcadlo `fights[j][i]`) plus nesmyslnou diagonálu sám se sebou —
      v exportu nesmí být ani duplicita, ani diagonála.
- [ ] Pavouk: v souboru je hlavní pavouk i repasáž.
- [ ] Neodehraný zápas v souboru s průběhem není. V přehledu je — s prázdným výsledkem,
      stejně jako na obrazovce svítí `-`.
- [ ] Přehled skupiny obsahuje jména, skóre v buňkách a dopočtené sloupce se stejnými
      čísly, jaká ukazuje obrazovka.
- [ ] Přehled pavouka pojmenovává kolo každého zápasu; repasážní zápasy jsou odlišené.
- [ ] Turnaj, ve kterém se ještě nic neodehrálo, se stáhnout dá a nespadne — průběh je pak
      samotná hlavička.
- [ ] Texty v `cs.ts` i `en.ts`.
- [ ] Na telefonu ověří uživatel (dle zadání „test na mobilu udělám až potom").

**Rozhodnuto (2026-08-16):**

1. **Přehled jako obrázek → vlastní ticket**, tady ne. Důvod stojí za zapamatování, protože
   jde proti intuici: **pavouk je čisté SVG** (`TreeNode.tsx:47` — jen `rect` a `text`, žádný
   `foreignObject`), takže obrázek z něj jde udělat serializací do canvasu **bez nové
   závislosti** a v plné šířce; kdežto **skupinová tabulka je HTML mřížka**
   (`GroupTournamentScreen.tsx:48`) se zamrzlým řádkem a sloupcem, na jejíž obrázek je
   potřeba `dom-to-image` a která je na obrazovce oříznutá scrollem. **U obrázku je to
   složitější u skupiny a jednodušší u pavouka** — přesně naopak než u CSV.
2. **Dvě tlačítka**, každé na jeden soubor. Jeden klik na dva soubory znamená na desktopu
   dotaz „povolit stahování více souborů?" a na telefonu dvě přílohy v jednom sdílení.
   Řada `Zrušit` / `Zpět` je plná, takže stažení dostanou vlastní řádek nad ní — stejně
   jako se v ticketu 002 řešilo přetékání řady u zápasu.
3. **Kola: finále, semifinále, jinak `N. kolo`** počítané od prvního, repasáž zvlášť.
   Čeština nemá zavedené slovo dál než pro semifinále — „čtvrtfinále" sedí jen na plný
   pavouk, který tenhle turnaj mít nemusí.

## C — Analýza

Podle rozhodnutí v `B`: **oba soubory jako CSV, obrázek až vlastním ticketem.**

**Reuse / gap:**

| Dílčí věc | Stav | Kde to žije / co reusnu |
| --------- | ---- | ----------------------- |
| Sloupce a řádky exportu zápasu | ✅ existuje | `src/logic/fightLog/csv.ts:84` (`headerRow`), `:112` (`eventRow`) — jen se rozdělí, aby šly použít dvakrát |
| Popis události textem | ✅ existuje | `src/logic/fightLog/format.ts:23` |
| Zápis CSV (`;`, bez BOM, quoting) | ✅ existuje | `src/utils/csv.ts:41` |
| Doručení souboru (sdílet / stáhnout) | ✅ existuje | `src/logic/download/exportFile.ts:69`, popisek přes `willShareFile` |
| Řádek tlačítek pod obsahem | ✅ existuje | `FightLog.tsx:47` `.fight-log__controls` — stejný vzor, samostatná řada |
| Data turnaje | ✅ existuje | `selectKumiteTimerTournamentGroup`, `…Tree`, `…RepechageTree`, `…Competitors`, `…TournamentName` |
| Výběr zápasů z turnaje (bez duplicit a placeholderů) | ❌ chybí | nové, `src/logic/tournament/` |
| Statistiky řádku skupiny (V/R/P/+/−/+−) | ⚠️ jen v komponentě | `GroupTableRow.tsx:21` — spočítané v `useEffect` do pěti `useState`; vytáhnout do čisté funkce |
| Název kola v pavouku | ❌ chybí | nové; `isFinal`/`isSemifinal` v `types/tournament.ts:137` pokrývají jen dvě nejvyšší |

**Kam to přijde:**

- `src/logic/fightLog/csv.ts` — **rozdělit** `buildFightCsv` na `fightCsvHeader()` a
  `fightCsvRows()`; `buildFightCsv` zůstane jako `buildCsv([header, ...rows])`, takže se
  export jednoho zápasu chová beze změny.
- `src/logic/tournament/collect.ts` (nový) — `tournamentFights(…): ExportedFight[]`, jedno
  místo, které ví, jak se z obou systémů dostane seznam odehraných zápasů.
- `src/logic/tournament/csv.ts` (nový) — `buildTournamentLogCsv`, `buildGroupOverviewCsv`,
  `buildTreeOverviewCsv`, `tournamentCsvFileName`.
- `src/types/tournament.ts` — `groupRowStats(row: Fight[])` jako čistá funkce.
- `src/components/kumiteTimer/tournamentScreen/GroupTableRow.tsx` — použije ji; **zmizí
  pět `useState` a `useEffect`.**
- `src/components/kumiteTimer/tournamentScreen/TournamentScreen.tsx` + `.scss` — řádek
  se dvěma tlačítky nad `.buttons`.
- `src/logic/translation/{translation,cs,en}.ts` — nové klíče.

**Postup:**

1. **Rozdělit hlavičku a řádky** v `fightLog/csv.ts`. Komentář na `:96` tenhle krok už
   předpovídá („the export of a whole tournament is then a concatenation of these") — tohle
   je ta konkatenace, a proto se sloupce nemění.
2. **`tournamentFights`** — dvě větve nad jedním výstupem `ExportedFight[]`:
   - **Skupina: jen horní trojúhelník** (`row < column`). Tabulka drží každý zápas dvakrát
     a `GroupTableCell.tsx:22` pouští do zápasu právě jen horní půlku, takže tam skóre sedí
     tak, jak se hrálo; dolní je zrcadlo se **stranově otočeným logem** (`switchResultSides`)
     a diagonála je zápas sám se sebou.
   - **Pavouk: průchod hlavním stromem i repasáží.** Vynechat kořen repasáže
     (`type === 'REPECHAGE_ROOT'`, umělý uzel z `tournament.ts:379`) a uzly, kde některá
     strana nemá `uuid` — to jsou placeholdery čekající na postupujícího.
   - **Odehraný** = neprázdný log **nebo** známý vítěz.
   - **Pořadí: chronologicky podle `at` první položky logu.** Zápasy bez logu na konec.
3. **Soubor s průběhem** = `fightCsvHeader()` + `fightCsvRows()` každého zápasu za sebou.
   Jméno turnaje se do řádků dostane přes `tournamentName` na `ExportedFight` — právě proto
   je ten typ v ticketu 002 strukturální podmnožina `Fight` a ne `Fight` sám: **reálný
   `Fight` mu vyhoví, jak je, takže se tu nic nemapuje.**
4. **Přehled skupiny** — hlavička = prázdná buňka, jména závodníků, V/R/P/+/−/+−; pak řádek
   na závodníka. Buňky `x:y` u odehraného, prázdno u neodehraného, prázdno na diagonále.
   **Statistiky přes `groupRowStats` nad celým řádkem, ne nad trojúhelníkem** — každý zápas
   je v řádku svého závodníka veden z jeho pohledu, o to se to zrcadlo stará. (Tady se ty
   dvě poloviny tabulky používají opačně než v kroku 2, což je přesně to místo, kde se dá
   šlápnout vedle.)
5. **Přehled pavouka** — řádek na zápas: kolo, AKA, AO, body AKA, body AO, vítěz. Kolo z
   `depth` a `type`: 0 → finále, 1 → semifinále, jinak `N. kolo` počítané od prvního
   (`getTreeDepth(tree) - depth + 1`), repasáž zvlášť. Placeholdery ano — v přehledu má
   nedohraná větev být vidět.
6. **Obrazovka** — vlastní řádek `.tournament-export` nad `.buttons`, dvě tlačítka,
   popisky podle `willShareFile(CSV_MIME_TYPE)` zjištěného jednou v `useState`, stejně jako
   `KumiteTimerScreen.tsx:80`.

**Plán testů:**

- [ ] `buildFightCsv` po rozdělení vrací **bajt v bajt totéž** co dnes (existující testy
      v `logic/fightLog/tests/csv.test.ts` musí projít beze změny).
- [ ] `tournamentFights` ze skupiny 3×3, kde jsou odehrané 2 zápasy → 2 položky, žádná
      diagonála, žádné zrcadlo; jména sedí na horní trojúhelník.
- [ ] `tournamentFights` z pavouka → hlavní i repasážní zápasy, bez `REPECHAGE_ROOT`
      a bez uzlů s prázdnou stranou.
- [ ] `tournamentFights` řadí podle času první události; zápas bez logu, ale s vítězem je
      na konci a v seznamu je.
- [ ] `buildTournamentLogCsv` ze dvou zápasů → jedna hlavička, pak řádky prvního a pak
      druhého; sloupce identické s `fightCsvHeader`.
- [ ] Prázdný turnaj → jen hlavička, žádný pád.
- [ ] `buildGroupOverviewCsv` → rozměr `(n+1) × (n+7)`, buňka odehraného `3:1`,
      neodehraného prázdná, diagonála prázdná, statistiky sedí na čísla z `groupRowStats`.
- [ ] `groupRowStats` = čísla, která dnes počítá `GroupTableRow` (V/R/P/+/−/+−).
- [ ] `buildTreeOverviewCsv` → kolo u finále, semifinále, prvního kola a repasáže.
- [ ] Obrazovka (Testing Library): dvě tlačítka jsou vidět u skupiny i u pavouka.
- [ ] Browser test: odehrát dva zápasy skupiny, stáhnout oba soubory, přečíst bajty —
      v průběhu jsou oba zápasy jednou, v přehledu sedí tabulka.

**Rizika a zařízení:**

Dotýká se souborů a sdílení, takže **na telefon to patří** — uživatel to podle zadání
udělá po dokončení. Konkrétně: dvě stažení krátce po sobě (Chrome na desktopu se ptá na
„více souborů", proto dvě tlačítka místo jednoho), a hlavně **velikost** — turnaj o 16
lidech s plnými logy je řádově stovky kilobajtů, což je pořád v pohodě pro blob i pro
sdílení, ale je to o dva řády víc než jeden zápas. Ostatní rizika jsou zděděná a už změřená
v ticketu 002: bez BOM, `text/csv` bez `;charset`, revoke blobu se zpožděním.

**Předpoklady:**

- Přehled se stahuje i pro turnaj, ve kterém se ještě nic neodehrálo — je to tabulka
  rozlosování a ta dává smysl i prázdná.
- Sloupce přehledu se **nepřekládají do stejného tvaru jako u průběhu**; jsou to jiná data,
  takže má vlastní hlavičku. Rohy zůstávají AKA/AO jako všude jinde.
- Vítěz v přehledu se píše jménem závodníka, ne rohem — přehled čte člověk, ne filtr.
- Jméno souboru drží vzor z ticketu 002 (`kumite-<datum>-<hhmm>.csv`), jen s rozlišením
  průběhu a přehledu a se jménem turnaje, pokud nějaké je.

**Otevřené otázky:** žádné — všechny tři byly zodpovězené na gatu, viz `B`.

## D — Hotovo

**Co se udělalo:** Dva commity. `eafd4e0` vytáhne hlavičku a řádky z `buildFightCsv`
a tally z `GroupTableRow` — nic nového, jen dosažitelné odjinud. `049870a` staví na tom
sběr zápasů z obou systémů (`logic/tournament/collect.ts`), tři stavitele CSV
(`logic/tournament/csv.ts`) a řádek dvou tlačítek na turnajové obrazovce. Sada je
188 unit testů (ze 151) a 81 browser testů (ze 71).

**Odchylky od C:** dvě.

- **Přehled skupiny nebere jména z `competitors`, ale z tabulky samotné.** Analýza počítala
  se seznamem závodníků; čtení jmen z `group[i][0].redName` je o jeden vstup míň a hlavně
  se soubor nemůže rozejít s tím, čeho je kopií.
- **`fileNameStamp` a `fileNameSlug` vznikly jako sdílený `logic/download/fileName.ts`**,
  místo aby si každý export razítko skládal sám. `groupStopwatch` má pořád vlastní kopii —
  vědomě, přepisovat cizí feature v tomhle ticketu nebylo v rozsahu.

**Gotchas:**

- **`react-d3-tree` v jsdom nespustíš.** Mountuje d3 zoom, který čte šířku z rozvrženého
  `<svg>`, a jsdom nerozvrhuje nic — obrazovka spadne dřív, než se dojde k assertu.
  Shimnout rozměry by dokázalo jen ten shim; pavouk patří do prohlížečové sady.
- **`store.dispatch` je otypovaný na prosté akce.** Uložení výsledku je thunk, takže
  v testu musí přes `AppThunkDispatch`. A pozor na ASI: řádek začínající `(store.dispatch
  as …)` se v repu bez středníků přilepí na předchozí `const` a rozbije se to na
  „this expression is not callable".
- **Repasážní zápasy mají všechny `depth === 0`**, protože je staví `newFight`, který depth
  neřeší. Uložená hloubka má význam jen v hlavním stromě — proto se úroveň při průchodu
  počítá, ne čte.
- **Dvě poloviny skupinové tabulky se používají opačně.** Do logu jen horní trojúhelník
  (dolní je zrcadlo s otočeným logem, diagonála je zápas sám se sebou), do statistik naopak
  celý řádek — právě proto, že to zrcadlo existuje. Mutace „horní trojúhelník → celá
  tabulka" shodí osm testů, takže to sedí, ale je to místo, kde se dá tiše šlápnout vedle.

**Ověřeno na:** desktop Chrome (Playwright, 81/81) a emulovaný viewport 375×667 v obou
jazycích. Změřeno, ne odhadnuto: obě tlačítka se vejdou na jeden řádek bez zalomení
(`lines: 1`, shodné `top`), nic nepřetéká, stránka nemá vodorovný scroll; v tmavém motivu
je tlačítko `rgb(163,165,168)` proti pozadí `rgb(82,82,86)`, tedy nezmizí — to je přesně
past, na kterou naletěl ticket 002.

**Testy ověřené mutacemi:** 17 mutací, **15 zčervenalo**. Dvě přežily a obě z dobrého
důvodu, ne kvůli díře v pokrytí:

- `Number.MAX_SAFE_INTEGER` → `Infinity` v porovnávači. `Infinity - Infinity` je `NaN`
  a jazyk nechává `NaN` komparátor na implementaci, jenže **V8 ho čte jako nulu**, takže
  výsledek je nerozeznatelný. Je to pojistka, ne oprava; komentář v kódu to teď říká
  na rovinu, protože původně tvrdil víc, než bylo pravda.
- Strážka diagonály v přehledu skupiny. Do buňky sám-se-sebou se nedá kliknout, takže
  nemá vítěze a vyšla by prázdná i bez ní. Nedosažitelná obrana, stejný případ jako
  `TIME_SET` v `BREAKS_GROUPING` u ticketu 001 — nechána a označena.

**Na telefonu ověřeno 2026-08-17** (uživatel, přes `yarn dev:https`): **oba soubory
v pořádku** — průběh i přehled. **Sheets si `3:1` nepřečetl jako čas**, takže obava
ze skóre v jedné buňce se nenaplnila a oddělovač zůstává.

Jedna věc zůstala nedořešená: **v přehledu vyšla na mobilu špatně diakritika**, kdežto
v zápase i v průběhu správně. Změřeno na bajtech, že **to není souborem** — všechny tři
exporty kódují `á` jako `c3 a1` a `Ř` jako `c5 98`, bez BOM, a staví je stejný `buildCsv`
se stejným MIME. Rozdíl je tedy v tom, jak se soubor otevřel: Sheets na Androidu čte
*lokální* CSV jako jednobajtové, kdežto přes sdílení do Drive se převod udělá serverově
(README, sekce o exportu výsledků). Zbývá potvrdit, že přehled šel jinou cestou než zápas;
pokud šel stejnou, je to nález a je potřeba ho dohledat.
