---
id: 010
slug: cleanup
title: Úklid mrtvého kódu, duplicit a konzistenčních odchylek
status: review
branch: cleanup
---

# Úklid mrtvého kódu, duplicit a konzistenčních odchylek

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Poslední ze čtyř ticketů podle dělení
uživatele („testy/konzistence/lint" bez testů, které jsou v ticketu 008).

Zadání uživatele k revizi znělo mimo jiné „zjednodušit/zkrátit kód" a „držet konzistenci
v návrhu jednotlivých částí kódu", a výslovně: „Nejde o to udělat z projektu nejlépe
navrženou aplikaci na světě."

## B — Zadání

**Problém:** V repu leží ~280 řádků, které nikdo nevolá nebo které říkají dvakrát totéž.
Nikoho to netlačí — proto je tenhle ticket poslední ze čtyř —, ale je to práce s nulovým
rizikem a měřitelným výsledkem.

**Rozsah:** Odebrání a sjednocení. Žádná změna chování; ticket je hotový, když je diff
záporný a sada zelená beze změny testů (kromě těch, které testovaly smazaný kód).

**Mimo rozsah:**

- **Lint.** 0 chyb, 64 preexistujících warningů. `CLAUDE.md` říká **nezhoršovat, ne uklízet**;
  vyčistit je při cizím ticketu je proti pravidlu repa. Žádná práce tady není.
- Velké přepisy, které revize zvážila a zamítla: generický builder pro `LS_ACCESS`
  (~70 ř., ale 6 souborů a typy), zrušení odvozeného `timeString` v `types/groupStopwatch.ts`
  (~40 ř., 5 souborů), 12 obalů v `src/components/icons/` (~96 ř., 14 souborů).
- Nové abstrakce „do zásoby". Sdílená komponenta vzniká jen tam, kde jsou ta místa
  **doopravdy stejná**, a musí ušetřit řádky.
- Konzistenční odchylky, které se opraví v ticketu 007 jako bugy (nezpevněná čtečka
  `localStorage`, mutace redux stavu, parser senchu, URL stopek, Start bez validace).
  Tady zbývá jen to, co chování nemění.

**Akceptační kritéria:**

- [ ] Smazané: `isBetween`, typ `NonFunc`, `selectLanguage`, `REACTIONS_LIMITS`, překladový
      klíč `lightTheme` (ve všech třech souborech překladů), `.hidden`/`.bold`/`.centered-text`
      v `global.scss`, zakomentované tlačítko „Try" ve třech set-up obrazovkách
      i s `handleTryAudio`.
- [ ] Mrtvý selektor `.__fight-stats__btns` je buď opravený na skutečný název
      (`__fight-stats__time-btns`), nebo smazaný. Past z ticketu 002.
- [ ] `parseTime` neobsahuje aparát na jednotky, který nikdo nevolá — `TimeUnit`,
      `castTable`, `castUnits` a prohazování `maxUnit`/`minUnit` pryč. Všechna tři
      produkční volání jsou jednoargumentová a výstup `M:SS` zůstane bajt po bajtu stejný.
- [ ] Blok „zvuk" (`Select` + `VolumeInput` + `handleAudioChange`) existuje jednou, ne
      třikrát. Chování všech tří set-up obrazovek beze změny.
- [ ] `Results.tsx` skládá název souboru přes `fileNameStamp` z `logic/download/fileName.ts`
      místo vlastní kopie; lokální `pad` pryč.
- [ ] `Results.tsx` odvozuje pořadí a řazení `useMemo`em, ne dvěma zřetězenými efekty —
      tabulka není při prvním renderu prázdná.
- [ ] Reducery `intervalTimer` a `page` nemají osm identických `case` větví.
- [ ] `updateRepechageTree` neopakuje tutéž logiku ve dvou dvojicích větví. **Až po
      ticketu 008** — bez testů nad repasáží je to slepý refaktor.
- [ ] Inicializátory `useState`, které staví objekt při každém renderu, jsou líné
      (`useState(() => ...)`). Na běžících stopkách jde o ~22 zbytečných konstrukcí za sekundu.
- [ ] `isPaused()` na všech třech třídách v `logic/timing/` a `isRunning()` na
      `PausableTimeout` i `PausableInterval` jsou pryč, nebo je někdo volá. V celém `src/`
      je jediné použití `clock.isRunning()` na `PausableStopwatch`
      (`GroupStopwatchScreen.tsx:166`) — zbytek je mrtvé API, které navíc na
      `PausableTimeout` **lže** (vypršelý timeout se hlásí jako běžící, viz ticket 011).
      Přidáno z review ticketu 008.
- [ ] `isValidModalWindowType` testuje řetězec, který v typu existuje — dnes je tam
      `'FIGHT_RESULT_MODAL'` proti typu `'FIGHT_RESULT'`, takže tvrdí opak pravdy
      v obou směrech. Nebo celý validátor pryč, protože se nikdy nespustí.
- [ ] `yarn test`, `yarn typecheck` a `yarn lint` končí přesně tak jako před ticketem —
      246+ testů zeleně, 0 chyb, **ne víc než 64 warningů**.

**Technicky** (malá dráha, `C` se nepíše):

Grepy, kterými se mrtvý kód dokazoval, a odhady úspory po položkách:
[report z revize](https://claude.ai/code/artifact/41b49176-0f80-4a4c-9c69-3a3796bb2d22).

- **Mazání dokázat, ne odhadnout.** U každého exportu grep přes celé `src/` včetně testů.
  Pozor na dynamické použití — v repu jsou dvě dynamicky skládané třídy (`__senchu-${color}`,
  `theme--${theme}`) a obě jsou živé; překlady se čtou tečkou, takže u nich grep stačí.
- **`parseTime`**: zúžit na `(sec) => 'M:SS'`. Osm případů z `utils/tests/time.test.ts:5–19`
  musí projít beze změny; `describe('parseTimeFromSeconds - given options')` odejde s tím
  aparátem.
- **Blok „zvuk"**: nová `src/components/common/soundSelect/SoundSelect.tsx` s props
  `{ sound, volume, onSoundChange, onVolumeChange }`, která drží i `preloadBeep`. SCSS
  je sdílené už dnes (`@include set-up-audio-div()`), takže se nemění.
- **Pořadí práce:** nejdřív mazání (nulové riziko, hned vidět), pak `Results.tsx`,
  pak `parseTime` a blok „zvuk". `updateRepechageTree` **až po ticketu 008**.
- **`parseTime` a ticket 007 se potkávají v jednom souboru** (`utils/time.ts`). 007 opravuje
  setiny v `parseMinTime`, tenhle ticket zužuje `parseTime` — jsou to různé funkce, ale
  ať jdou po sobě, ne paralelně.

**Rizika a zařízení:** netýká se. Jediná věc, která se vizuálně projeví, je oprava nebo
smazání `.__fight-stats__btns` — zkontrolovat pořadí tlačítek na XL šířce.

**Předpoklady:**

- Smazání překladového klíče `lightTheme` projde typecheckem jen tehdy, když zmizí ze všech
  tří souborů naráz (`translation.ts`, `cs.ts`, `en.ts`).

## Review

Branch: `cleanup` · revieweři: `correctness`, `react-state`, `device-ux`, `tests`. Všichni
čtyři schválně — diff sahá na doménovou logiku (`updateRepechageTree`, dva reducery), na
komponenty a hooky (`Results`, nová `SoundSelect`, líné `useState`), na SCSS a překlady
(`FightStats`, `global.scss`, `lightTheme`) i na testy (sedm smazaných případů `parseTime`).

**`react-state`: bez nálezů.** Doložil, že mutace `.place` uvnitř `useMemo` sahá jen na
objekty čerstvě vyrobené `newCompetitorWithPlace`, takže prop `competitors` zůstává
nedotčený; že `onSoundChange={setAudioSound}` je holý setter, takže `useCallback`
v `SoundSelect` drží; a že žádný z líných inicializátorů nemění sémantiku, protože ani
jedna z těch hodnot není funkce. Navíc: smazané `PausableInterval.isRunning()` nebylo jen
mrtvé, ale **lhalo** — vracelo `intervalId !== undefined` a ignorovalo `timeoutId`, takže
během úvodní fáze intervalu hlásilo běh, který ještě nezačal.

**`device-ux`: bez nálezů.** Nezávisle přepočítal tabulku `order` v `FightStats.scss` a
potvrdil, že oprava mrtvého selektoru vykreslí totéž. Doplnil, co jsem neověřoval: XL je
`min-width: 1280px`, takže se to netýká telefonu ani tabletu na šířku, a `grep "order:"`
přes všechny SCSS vrací pouze těch sedm řádků v jednom souboru, takže do toho nemluví jiný
breakpoint. Ověřil i variantu `isMirror`, kde se tlačítka času vůbec nerenderují. K DOM:
`SoundSelect` je fragment, takže vykreslený strom i třídy jsou znak po znaku stejné, a
`preloadBeep` zůstal synchronně uvnitř user gesture — což je to, co na iOS Safari odemyká
zvuk.

**`correctness`: jeden nález.** Zbytek ověřen: `parseTime` přehrál starou implementaci
proti nové na 250 510 vstupech s nulou rozdílů, `VALIDATOR` se opravdu nikde neiteruje
(takže smazání `isValidModalWindowType` je správné), a `updateRepechageTree` prošel větev
po větvi včetně chybějící linky a prázdných dětí.

**`tests`: čtyři nálezy.** Pustil 11 mutací produkčního kódu, každou proti celé sadě.

### Opravit (90–100)

- [major] `GroupStopwatchScreen.tsx:40`, `ReactionsScreen.tsx:46`, `IntervalTimerScreen.tsx:46`,
  `KumiteTimerScreen.tsx:75` · `correctness`, jistota 95 · **kritérium o líných
  inicializátorech minulo přesně ta čtyři místa, kvůli kterým vzniklo.** Věta v zadání o
  „~22 konstrukcích za sekundu na běžících stopkách" mířila na `useState<PausableInterval>(new
  PausableInterval(emptyFunc, 0))` a jeho tři sourozence — ty obrazovky se překreslují na
  každý tik, takže každý tik postavil zahozené druhé hodiny. Tři místa, která jsem zlínil,
  na té cestě nejsou. Můj census je minul, protože grepoval `useState(new`, zatímco tady je
  mezi tím typový parametr. → všechny čtyři líné; konstruktory mají `start = false` a jen
  přiřazují pole, takže odložení nic neplánuje jinak · **✅ opraveno**
- [major] `src/utils/tests/time.test.ts` · `tests`, jistota 100 · **`Math.floor` → `Math.round`
  v novém `parseTime` prošlo celou sadou.** Všech osm zbylých případů má sekundy < 30, kde
  se floor a round shodnou; s round by `parseTime(105)` vypsalo `2:-15` na hodinách zápasu.
  Druhá díra: s odejitým `describe`em zmizel jediný desetinný vstup, takže i `Math.floor(sec)`
  → `Math.round(sec)` bylo neviditelné. → tři případy doplněny (`45`, `105`, `59.9`), obě
  mutace teď padají · **✅ opraveno**
- [major] `src/redux/page/reducer.ts`, `src/redux/intervalTimer/reducer.ts` · `tests`,
  jistota 100 · **pět z osmi sloučených `case` labelů nechytil žádný test.** Fallthrough je
  přesně ten tvar, kde se label ztratí jedním smazaným řádkem a akce začne tiše propadat do
  `default`, který vrací nezměněný stav. → dva reducer testy, které pro každou akci trvají
  na tom, že se stav vrátil změněný; **osm z osmi labelů teď padá** · **✅ opraveno**
- [major] `src/components/common/soundSelect/SoundSelect.tsx` · `tests`, jistota 100 ·
  **nahrazení celého těla komponenty za `<></>` nechalo sadu zelenou.** Ani jedna ze tří
  set-up obrazovek nemá vlastní test, takže extrakce sdíleného bloku proběhla s nulovým
  pokrytím. → komponentový test na to, co řádek hlásí zpátky a co dělá bez zvoleného zvuku;
  chytá prázdný render, ztracený `disabled`, prohozené handlery i nepředanou hlasitost
  · **✅ opraveno**
- [major] `src/types/tests/tournament.test.ts` · `tests`, jistota 95 · **výsledek druhé
  repasážní linky šlo zapsat do první a testy to nerozlišily.** `vi.mock('uuid')` dává všem
  zápasům v souboru jedno uuid, takže `updateTournamentTree` matchne i cizí linku, a test
  asertoval jen skóre. → assert doplněn o `type` a jména · **✅ opraveno**
- [minor] `src/types/tournament.ts:535` · `tests`, jistota 95 · **kontrola
  `semifinals.length <= index` byla úplně netestovaná** — její odstranění prošlo sadou,
  přestože na pavouku bez dětí hodí TypeError. → případ „pavouk o dvou" · **✅ opraveno**

### Nechal jsem na tebe

- `src/components/groupStopwatch/results/tests/Results.test.tsx` · `tests`, jistota 100 ·
  **kritérium „tabulka není při prvním renderu prázdná" nemá test a mít ho levně nemůže.**
  Reviewer vrátil `Results.tsx` na verzi z `main` a všech 12 testů prošlo: RTL `render()`
  flushuje efekty uvnitř `act()`, takže obě varianty jsou pro sadu nerozlišitelné. Jediná
  cesta je render bez efektů přes `renderToString`, což do klientské SPA bez jediného jiného
  SSR místa tahá nový vzor kvůli jednomu assertu. **⏸ neopraveno** — kritérium je splněné
  úvahou (dva `useMemo` místo dvou efektů píšících do stavu), ne testem, a takhle je to
  napsané i níž v „Ověřeno na".
- `src/logic/timing/pausableTimeout.ts:24` · `tests`, jistota 90 · **`isRunning()` přežil
  úklid kvůli testu, ne kvůli produkci.** V celém `src/` ho volá jediné místo —
  `pausableTimeout.test.ts:89`, tedy test, který pinuje známou lež z ticketu 011. Smazat ho
  by znamenalo přepsat test dokumentující chybu, aby smazání bylo možné. Kritérium to
  připouští („nebo je někdo volá"), ale je to jediná metoda veřejného API, která zůstala
  bez produkčního volajícího. **⏸ neopraveno, pojmenováno.**

### Nález mimo rozsah (nalezeno při psaní reducer testů)

- `src/redux/intervalTimer/utils.ts:82` + `actions.ts:186` · **`saveAdvancedSeries` mutuje
  `initialState`.** Když v `localStorage` nic není, `getValidatedObjectFromLS` vrátí fallback
  `initialState.advancedSavedSeries` **referencí** a akce do něj rovnou `push`ne — takže
  uložení série trvale změní výchozí stav modulu pro zbytek běhu. Projevilo se to prosáknutím
  série mezi testovými případy. Do 010 to nepatří (byla by to změna chování, a „mutace redux
  stavu" měl v rozsahu ticket 007), reducer test to obchází seedem přes storage a říká to
  u sebe v komentáři. **Kandidát na ticket 016 nebo vlastní bug ticket.**
- `SoundSelect.tsx:36` · `<label>` bez `htmlFor` · zdědil to stav před ticketem, kde to bylo
  stejně ve všech třech obrazovkách; teď by to ale byla oprava na jednom místě místo tří.
  **Kandidát na 016** (nezapsal jsem tam, 016 je tvoje kurátorovaná sbírka).

**Bez nálezů:** `react-state`, `device-ux`.

## D — Hotovo

Branch `cleanup`, 12 commitů (z toho jeden zakládá ticket 016).
`git diff main..HEAD --shortstat`: 36 souborů, +444 / −372.

Rozdělené podle toho, co je co:

| Část | Soubory | Řádky |
| --- | --- | --- |
| **Produkční kód** | 30 | **+150 / −352 → čistě −202** |
| Testy | 5 | +241 / −20 |
| Tickety (010 + 016) | 2 | +53 / 0 |

Kritérium „diff je záporný" tedy platí pro produkční kód, kvůli kterému ticket vznikl.
Testy jsou nad plán a přišly z review — sada, která nechytí pět z osmi sloučených
`case` labelů, nemůže ten refaktor podepsat.

### Kritérium po kritériu

| Kritérium | Stav | Kde |
| --- | --- | --- |
| Smazat `isBetween`, `NonFunc`, `selectLanguage`, `REACTIONS_LIMITS`, `lightTheme`, tři třídy z `global.scss`, „Try" ve třech obrazovkách | ✅ vše, každé doložené grepem přes `src/` včetně testů | `validators.ts`, `function.ts`, `page/selector.ts`, `reactionsUrl.ts`, tři soubory překladů, `global.scss`, `mixins.scss`, tři set-up obrazovky |
| `.__fight-stats__btns` opravit nebo smazat | ✅ opraveno na `__fight-stats__time-btns`; **vizuálně no-op**, viz níž | `FightStats.scss:108` |
| `parseTime` bez jednotkového aparátu | ✅ `(sec) => 'M:SS'`; `TimeUnit`, `castTable`, `castUnits` i prohazování mezí pryč | `utils/time.ts` |
| Blok „zvuk" jednou místo třikrát | ✅ nová `SoundSelect` (57 ř.), tři obrazovky dohromady o 89 ř. kratší → čistě −32 | `components/common/soundSelect/` |
| `Results.tsx` přes `fileNameStamp`, lokální `pad` pryč | ✅ | `Results.tsx:15` |
| `Results.tsx` odvozuje `useMemo`em | ✅ dva efekty → dva `useMemo` | `Results.tsx:39–63` |
| Reducery bez osmi identických větví | ✅ 3 + 5 sloučeno fallthroughem | `page/reducer.ts`, `intervalTimer/reducer.ts` |
| `updateRepechageTree` bez dvou dvojic větví | ✅ čtyři větve → dvě + `repechageChildren` | `types/tournament.ts:498–560` |
| Líné `useState` inicializátory | ✅ **sedm míst**, ne tři — čtyři z nich našlo až review | čtyři play obrazovky, `groupStopwatch/setUpScreen`, `IntervalTimerScreen`, `useValidatedState` |
| `isPaused()` / `isRunning()` pryč nebo volané | ✅ čtyři smazané, dvě zůstaly (jedna kvůli testu — viz Review) | `logic/timing/` |
| `isValidModalWindowType` | ✅ **smazán celý**, ne opraven — viz odchylky | `types/modalWindowType.ts`, `redux/page/utils.ts` |
| `test`, `typecheck`, `lint` jako před ticketem | ✅ 483 testů (z 473), 0 typecheck chyb, **0 lint chyb / 59 warningů** proti 61 na `main` | — |

### Odchylky od zadání

- **`isValidModalWindowType` jsem smazal, ne opravil.** Zadání nabízelo obojí. Ověřil jsem
  premisu druhé varianty: `VALIDATOR.modalWindow` se nikdy nevolá — mapa se nikde neiteruje
  a `getValidatedStringFromLS` dostává jen `.theme` a `.language`. `modalWindow` teď má
  `anythingIsValid` stejně jako sousední nepersistovaný `translation`, takže oba nečtené
  klíče říkají totéž. Opravit řetězec by znamenalo nechat v repu správnou kontrolu, kterou
  nikdo nespustí — a ta jednou už tiše zdegenerovala právě proto, že ji nic necvičilo.
- **Oprava `.__fight-stats__btns` není vizuální změna.** `time-btns` drží z base pravidla
  `order: 3` a XL blok přepisuje `senchu` z 1 na 3 — obě tedy mají 3, remíza se rozpadá
  podle pořadí v DOM a `time-btns` jsou v DOM dřív. Výsledek `time → time-btns → senchu →
  settings` je před i po opravě stejný; pravidlo teď jen říká, co obrazovka stejně dělá,
  místo aby k tomu docházelo remízou. Ověřeno nezávisle dvěma revieweery.
- **Lint baseline je 61, ne 64.** `CLAUDE.md` mluví o ~74, zadání o 64; naměřeno na `main`
  v tomhle worktree je 61. Po ticketu je 59 — ubyly dva `react-hooks/set-state-in-effect`
  z `Results.tsx`. Žádný nový nepřibyl.
- **`reactions/reducer.ts` jsem nechal.** Má dvě identické větve, které by šlo sloučit
  stejně, ale zadání počítalo přesně osm a jmenovalo dva reducery. Dvě větve jsou na
  fallthrough tenké.
- **Sedm smazaných testů `parseTime`.** Všech sedm volalo funkci se čtyřmi argumenty, tedy
  výhradně smazaný aparát. Jediná ztráta, která se týkala přeživší funkce, byl desetinný
  vstup — vrácen v review jako `59.9`.
- **Testy nad rámec zadání.** Ticket říkal „beze změny testů". Review ukázalo, že tři
  z osmi refaktorů (reducery, `SoundSelect`, druhá repasážní linka) nedrželo nic; přidal
  jsem pokrytí, protože refaktor bez sítě je v tomhle ticketu ta jediná věc, která může
  tiše ublížit.

### Čím se to dokazovalo

- **`parseTime`**: stará implementace přehraná proti nové na 160 tisících vstupech (všechny
  celé sekundy do 100 000, desetiny do 6 000, záporné hraniční hodnoty) — **0 rozdílů**.
  Reviewer to nezávisle zopakoval na 250 510 vstupech, rovněž 0.
- **Mutační ověření po opravách**: každá díra, kterou review našlo, byla po opravě znovu
  zmutována. `Math.floor`→`round` na minutách i sekundách, výsledek repasáže do špatné
  linky, vypuštěná kontrola chybějícího semifinále, osm `case` labelů po jednom, čtyři
  mutace `SoundSelect` — **všechny teď padají**, předtím jich 12 procházelo zeleně.
- **Reverz `REPECHAGE_LINES`** shodí 7 testů, takže pořadí linek, které refaktor musel
  zachovat, drží sada a ne pečlivé čtení diffu.

### Ověřeno na

**Na telefonu neověřeno — a podle obou relevantních optik to tenhle ticket nepotřebuje.**
Diff nesahá na sdílení, soubory, zvukovou cestu ani secure context; `SoundSelect` je
fragment se znak po znaku stejným DOM, `preloadBeep` zůstal uvnitř user gesture a název
CSV souboru je znak po znaku stejný (drží ho regex v `Results.test.tsx`).

Jediné místo, kde se hnul živý selektor, je XL blok `FightStats.scss`, a XL je
`min-width: 1280px` — na telefon nedosáhne. Pokud to chceš mít odklepnuté okem:
**na monitoru ≥ 1280 px otevřít kumite časomíru a zkontrolovat, že shora jde
čas → tlačítka času → Senchu → nastavení.** To je celý seznam.

Neověřené testem, vědomě: „tabulka není při prvním renderu prázdná" — viz Review.
