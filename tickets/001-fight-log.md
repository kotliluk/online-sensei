---
id: 001
slug: fight-log
title: Log průběhu kumite zápasu
status: done
branch: fight-log
---

# Log průběhu kumite zápasu

> **Dopsáno zpětně.** Kód vznikl dřív než tohle flow. `A` je doslovná, `B` a `C`
> rekonstruují, co se doopravdy rozhodovalo (ne co by se bylo rozhodlo), `D`
> a `Review` popisují skutečný stav — včetně toho, že revieweři neběželi.

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-15

„přidáme možnost stažení výsledků i do kumite timeru. rozdělil bych to na 3 fáze:

1. logování průbehu zápasu - na entitě zápasu mít i append log událostí, např.
   „timestamp, fightTime, action", kde action jsou věci jako „aka point", „ao senchu",
   „fight paused", „time increased"
   - možná by bylo fajn akce v jeden „fightTime" groupovat, např. ne 3 samostatní
     „aka point" logy, ale jeden „aka 3 points", podobně „time changed to 1:22"
   - pro vývoj, debugging a testování můžeme logy zobrazovat na obrazovce časomíry -
     asi je to užitečná feature i do prod apky, proč ne
2. export jednotlivého zápasu (nové tlačítko zobrazené ve „start" a „back") - stáhne
   aktuální stav + logy jako CSV asi
3. export celého turnaje - jeho celkový stav, stav a logy jednotlivých zápasů"

Upřesnění po analýze:

- „Slučovat jen do bezprostředně předchozí položky" — není potřeba, v karate se nedá
  udělit v jednu chvíli více jednotlivých bodovaných technik jednomu závodníkovi, takže
  sekvence „aka +1, ao +1, aka +1" v jeden čas znamená zřejmě nějakou opravu, proto bych
  ji zgroupoval taky.
- Po znovuotevření zápasu v turnaji klidně dále jeho předchozí log rozšiřovat.
- Reset zápasu: log nechat. Struktura CSV pro fázi 2: plochý tvar, řádek na událost.

## B — Zadání

**Problém:** Když u stolku někdo namítne, jak se skóre dostalo tam, kde je, nemá to
rozhodčí z čeho doložit — časomíra ukazuje jen aktuální stav. Zároveň bez záznamu
průběhu nemá co exportovat fáze 2 a 3.

**Rozsah:**

- Každá změna zápasu se zaznamená s časem na hodinách, ve kterém nastala.
- Stisky patřící k jednomu rozhodnutí se slučují do jedné položky.
- Panel „Průběh zápasu" pod tlačítky časomíry, defaultně zavřený.
- U turnajového zápasu log putuje s entitou zápasu — přežije reload i znovuotevření.

**Mimo rozsah:**

- Export zápasu do CSV (fáze 2) a export turnaje (fáze 3) — vlastní tickety.
- Zobrazení logu v zrcadlícím okně — to je pro diváky.
- Zalomení řady tlačítek na telefonu; je to bod 4 v `TODO.md` a předchází fázi 2.

**Akceptační kritéria:**

- [ ] Tři stisky `+` u aka v jednom čtení hodin dají jednu položku `AKA +3`.
- [ ] `aka +1, ao +1, aka +1` v jednom čtení dá `AKA +2` a `AO +1` v tomhle pořadí.
- [ ] Bod udělený a hned odebraný nezanechá položku vůbec.
- [ ] Běh stisků `-` u času dá jednu položku `2:00 → 1:55`.
- [ ] Start, pauza a pokračování se neslučují nikdy.
- [ ] Reset zápasu log nemaže a sám se do něj zapíše.
- [ ] Přes reset, ruční změnu času ani znovuotevření se neslučuje.
- [ ] Stisk, který narazí na limit (`+` na skóre 99), se nezaloguje jako změna.
- [ ] Prohození stran vlevo/vpravo se neloguje — je to pohled, ne stav zápasu.
- [ ] Log turnajového zápasu se uloží, přežije reload a po znovuotevření pokračuje
      položkou se skóre, na kterém se otevíral.
- [ ] Zrcadlená buňka skupinové tabulky má v logu prohozené rohy stejně jako skóre.
- [ ] Panel je defaultně zavřený a všechny texty jsou v `cs.ts` i `en.ts`.

## C — Analýza

**Reuse / gap:**

| Dílčí věc                     | Stav        | Kde to žije / co reusnu                                                                                       |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| Entita zápasu                 | ✅ existuje | `src/types/tournament.ts:32` — `Fight`, plus operace v témže souboru (vzor „typy a jejich operace pohromadě") |
| Persistence s fallbackem      | ✅ existuje | `src/logic/localStorage/access.ts:77` — `getValidatedTypeFromLS`                                              |
| Validace uloženého tvaru      | ✅ existuje | `isValidFight` `tournament.ts:116`                                                                            |
| Formátování času              | ✅ existuje | `parseTime` `src/utils/time.ts:23`                                                                            |
| Doplňování parametrů do textů | ✅ existuje | `insertWords` `src/logic/translation/index.ts:25`                                                             |
| Kontrolovaný state            | ⚠️ částečně | `useControlledState` hodnotu mimo limit tiše zahodí a neřekne to                                              |
| Sběr událostí                 | ❌ chybí    | nový `src/types/fightLog.ts`                                                                                  |

**Kam to přijde:**

- `src/types/fightLog.ts` — typy událostí + čistá `appendFightEvent`.
- `src/types/senchu.ts` — `switchSenchu` (dosud vnořený ternář v `switchResultSides`).
- `src/types/tournament.ts` — `log` na `Fight` a `FightResult`, validace, prohození stran.
- `src/logic/fightLog/format.ts` — jedna položka na řádek textu v jazyce UI.
- `src/components/kumiteTimer/fightLog/FightLog.tsx` + `.scss` — panel.
- `src/components/kumiteTimer/kumiteTimerScreen/KumiteTimerScreen.tsx` — napojení.
- `FightResultModal.tsx` — log musí projít i skrz modál s vítězem.
- `cs.ts`, `en.ts`, `translation.ts`.

**Postup:**

Události jsou **discriminated union, ne text**. Log se ukazuje v obou jazycích, slučování
musí umět odlišit druh události, a fáze 2 chce hodnoty ve vlastních sloupcích CSV.

Skóre i fauly se nastavují **absolutně** (`Score.tsx:32`, `Fouls.tsx:15`), takže položka
vzniká diffem. Napojení proto přes **obalené settery, ne `useEffect`** — efekt by po
zapnutí StrictMode střílel dvakrát a neodlišil by uživatelský stisk od načtení uloženého
zápasu (`KumiteTimerScreen.tsx:202`). `useControlledState` se rozšíří tak, aby setter
vrátil, jestli hodnotu vzal.

Slučování má dvě různé redukce: **body se sčítají**, ostatní **drží poslední hodnotu**.
Okno je jedno čtení hodin, bez požadavku na sousednost (viz `A`), a končí u události, po
které se hodiny vracejí — start, reset, ruční změna času, znovuotevření.

**Plán testů:**

- [ ] Jednotkově nad `appendFightEvent`: sčítání bodů, slučování přes cizí roh, vynulování,
      hranice okna u resetu i znovuotevření, běh změn času, fauly a senchu, neměnnost vstupu.
- [ ] Jednotkově `switchFightLogSides` a `isValidFightLog` (včetně chybějícího logu).
- [ ] V prohlížeči: celý zápas odehraný přes UI; a turnajová dráha — uložení, `localStorage`,
      zrcadlená buňka, reload, znovuotevření.

**Rizika a zařízení:** Prohlížečových API se změna nedotýká — žádné `navigator.*`, audio,
bloby ani soubory. Zůstává **layout**: panel přibývá na obrazovku, která už nese
`// TODO - update mobile phone view` a je bodem 4 v `TODO.md`.

**Předpoklady:**

- `REOPEN` nese jen skóre, ne fauly a senchu — na značku „tady se navazovalo" to stačí
  a celý stav stejně drží entita zápasu.
- Rohy se v logu píšou jako AKA/AO bez jmen; jména jsou v hlavičce obrazovky a půjdou
  do metadat CSV.
- Log je **záznam, ne replay stream** — ze samotného logu se stav znovuotevřeného zápasu
  nezrekonstruuje, protože počáteční skóre se načetlo, ne naskórovalo.

## D — Hotovo

**Co se udělalo:** Commit `fee3ffe` (implementace) a druhý s opravami z review. Čistá
`appendFightEvent`, panel na obrazovce, log na entitě zápasu včetně persistence
a prohození stran u skupiny. Sada je po review **118 testů** (z 98 před ním): jednotkově
`fightLog`, `switchResultSides`, `useControlledState` a nově i chování obrazovky přes
Testing Library. Navíc 15 browser testů, které ale žijí mimo repo — viz bod 3 v `TODO.md`.

**Odchylky od B/C:**

- **`log` na `FightResult` je povinný, na `Fight` volitelný.** Nebyl to plán, ale nález:
  browser test ukázal, že se log do `localStorage` vůbec nedostal, protože
  `FightResultModal.handleConfirm` staví `FightResult` po polích a `log` tam chyběl.
  Povinnost to příště shodí při překladu. Na `Fight` volitelný zůstat musí — uložený
  turnaj z minulého víkendu log nemá a `getValidatedTypeFromLS` neplatnou hodnotu **tiše
  přepíše defaultem**, čili přísnější validace by rozjetý turnaj smazala.
- **Změny času se slučují sousedností, ne čtením hodin.** Nešlo jinak: každý stisk `-`
  čtení mění, takže pět stisků je pět různých čtení a pravidlo z `A` by je nikdy nespojilo.
- **Načítání turnajového zápasu je klíčované na `uuid` zápasu, ne na objekt.** Uložení
  dispatchne nový objekt, efekt by se rozeběhl znovu a přepsal log, který zápas právě
  dostal, plus přidal druhou značku znovuotevření.
- Opraveny dva preexistující `exhaustive-deps` warningy v `KumiteTimerScreen.tsx`, kterých
  se diff stejně dotýkal. Preexistujících warningů je teď **66**, ne ~74 jako říká
  `CLAUDE.md`.

**Gotchas:**

- **`switchResultSides` není to tlačítko na prohození stran.** Tlačítko je `handleSwitchSides`
  → `redOnLeft` a je čistě zobrazovací. `switchResultSides` (`tournament.ts:77`) se volá
  z `updateGroupTable` a zrcadlí zápas do protilehlé buňky skupiny. **Staví nový objekt
  výčtem polí**, takže cokoli nového na `FightResult` se v druhé půlce tabulky tiše ztratí.
- **Odchod z turnajového zápasu končil na set-up obrazovce** — a nešlo jen o uložení,
  stejně dopadalo i tlačítko Zpět. Obě cesty navigují na tabulku správně, jenže je
  přebil redirect efekt: `setNotActualKumiteTimer()` a `navigate()` jdou v jedné dávce,
  takže obrazovka stihne přerenderovat s `isActual === false` ještě jako namontovaná
  a efekt pošle uživatele na set-up **navrch** zvolené trasy. Zachyceno zásobníkem volání
  u `history.pushState`, ne odhadem. Opraveno spolu s ostatními; ostatní čtyři feature
  obrazovky mají stejný tvar, ale tam je cíl odchodu shodou okolností právě jejich set-up,
  takže se to nikdy neprojevilo.
- Řada tlačítek časomíry (`KumiteTimerScreen.scss:45`) byla flex **bez zalomení** a se
  čtyřmi tlačítky přetékala telefon. Opraveno (`flex-wrap` + `row-gap`), změřeno na 412 px:
  žádné tlačítko už nepřečnívá, „Zpět" se zalomí na druhý řádek.

**Ověřeno na:** **Jen desktop Chrome** (Playwright, 63/63) a emulovaný viewport 412×915 —
což je rozlišení, ne zařízení. Na reálném telefonu **neověřeno**. Prohlížečových API se
změna nedotýká, takže riziko je jen layoutové: čitelnost panelu, jeho vlastní scroll
a to, jestli nezhorší už tak přetékající řadu tlačítek u turnajového zápasu.

Barva tlačítka v tmavém motivu je ověřená měřením v prohlížeči (spočtené `background`
tlačítka proti pozadí obrazovky), ne okem — po opravě `rgb(165,166,169)` na
`rgb(82,82,86)`. Testy jsou ověřené mutacemi: 13 mutací v kopii repa, všech 13 zčervenalo.

**Co na telefon zbývá:** otevřít turnajový zápas se jmény závodníků, bez scrollování
najít tlačítko „Průběh zápasu", ťuknout a zjistit, jestli je z toho poznat, že se něco
stalo — v obou motivech.

## Review

Branch: `fight-log` · revieweři: všichni čtyři (`correctness`, `react-state`, `device-ux`,
`tests`) — diff sahá na `src/types/` i `src/components/`, na hooky a efekty, a přidává
texty do obou jazyků.

**Opravit (90–100) — vše opraveno**

- [major] `KumiteTimerScreen.tsx:118` + `Score.tsx:32` · tlačítko `0` u skóre při skóre 0
  pošle platnou hodnotu, setter vrátí `true` a do logu spadne `AKA 0`; totéž
  „Reset času" ve fázi `init` zapíše `2:00 → 2:00` a tou prázdnou položkou navíc **rozdělí
  slučování**, protože `TIME_SET` je hranicí okna → invariant „log neobsahuje položku,
  která nic nezměnila" přesunut do `appendFightEvent` (`isNoOp`), ne do pěti volajících ·
  **✅ opraveno** (nález korektnosti a react-state, sloučeno — jedna příčina)
- [major] `FightLog.scss:17` · `button-color($grey)` — `$grey` je `primary-color` tmavého
  motivu a tlačítka nemají okraj, takže se tlačítko v tmavém motivu **ztratí v pozadí**
  a objeví se až na hover, který telefon nemá. Změřeno: pozadí i tlačítko
  `rgb(82,82,86)` → `$grey-light`, po opravě `rgb(165,166,169)` na `rgb(82,82,86)` ·
  **✅ opraveno**
- [minor] `KumiteTimerScreen.tsx:42-45` · validátory byly inline šipky, takže settery
  měnily identitu při každém renderu a efekt načítající zápas se ve skutečnosti spouštěl
  po každém tiku — držel ho jen ref, deps lhaly → validátory na úroveň modulu ·
  **✅ opraveno**
- [minor] `FightLog.tsx:50` · komentář u index-key tvrdil, že se položky jen přidávají;
  `appendFightEvent` umí smazat položku z prostředka → komentář opraven na to, co kód
  dělá, a proč to u bezstavových položek nevadí · **✅ opraveno**
- [minor] `FightLog.tsx:49` · scrollovací seznam bez třídy `with-scrollbar`, kterou mají
  všechny ostatní scrollovací seznamy v appce · **✅ opraveno**
- [major] `tournament.ts:88` · mutace `log: switchFightLogSides(fight.log)` → `log:
fight.log` **prošla celou sadou** — prohození logu v zrcadlené buňce nehlídalo nic ·
  **✅ opraveno** (3 testy nad `switchResultSides`, kryjí i `switchSenchu` pro `BLUE`)
- [major] `fightLog.ts:50` · `BREAKS_GROUPING` bez `'START'` prošlo celou sadou ·
  **✅ opraveno** (viz poznámka k `TIME_SET` níž)
- [major] `fightLog.test.ts` · test na neměnnost volal `appendFightEvent` jen ve
  slučovací větvi, takže `log.push(entry); return log` v přidávací větvi prošlo — a to
  není kosmetika, sdílená reference by nechala React bailoutnout a panel by přestal
  přibývat · **✅ opraveno** (všechny tři větve + assert na novou referenci)
- [minor] `fightLog.ts:83` · zrušení senchu (`RED → NONE`) položku nemazalo a nikdo to
  nehlídal, přestože pro body i fauly ten test je · **✅ opraveno**
- [major] `useControledState.ts` · nový boolean kontrakt setteru neměl žádný test ·
  **✅ opraveno** (nový `src/logic/hooks/tests/useControledState.test.ts`, včetně
  stability identity setteru)
- [major] chování obrazovky nemělo v repu **žádný** test — pět akceptačních kritérií
  viselo jen na Playwright sadě mimo git · **✅ opraveno** (6 testů přes Testing Library
  podle vzoru `src/tests/app.test.tsx`)

**Zvážit (80–89) — rozhodnuto**

- ✅ **rozhodnuto: ponechat.** `KumiteTimerScreen.tsx:238` · po konci zápasu jsou tlačítka
  času povolená, takže `+` a `-` vrátí hodiny na nulu a efekt zapíše **druhý** „Konec
  zápasu". Uživatel to potvrdil jako žádoucí — návrat hodin na nulu je událost, která se
  u stolku stala, a log ji má ukazovat. Není to dluh.
- `tournament.ts:134` + `fightLog.ts` · `isValidFightLog` je shovívavý jen k **chybějícímu**
  logu. Log přítomný ve špatném tvaru vrátí `false` → `isValidFight` `false` →
  `getValidatedTypeFromLS` přepíše celý klíč defaultem a **rozehraný turnaj je pryč**.
  Tuhle cestu otevřel tenhle diff (dřív pole `log` neexistovalo) a je to jediné pole
  `Fight`, jehož tvar se má ve fázi 2/3 dál vyvíjet. Oprava (nevázat platnost zápasu na
  log a vadný log zahodit zvlášť) je netriviální a mění chování persistence.
- `FightLog.tsx:41` · na reálném telefonu s lištou prohlížeče se panel nejspíš otevře pod
  okrajem obrazovky a tlačítko nedává najevo, že je otevřeno (chybí `aria-expanded`
  i šipka). Scroller je `.app`, ne dokument, takže se adresní řádek nesbalí. Chce to
  **ověřit na zařízení**, ne opravovat naslepo.
- `fightLog.test.ts:231` · v `test.each` pro `isValidFightLog` jsou dva případy
  nedosažitelné (netextový `fightTime`, `[null]`) — každý existující vstup padne dřív na
  jiné podmínce.

**Poznámka — nález, který platí jen z poloviny:** `tests` hlásil, že mutace
`BREAKS_GROUPING` bez `'TIME_SET'` projde. Prošla, ale ne kvůli chybějícímu pokrytí:
položka `TIME_SET` se stampuje časem `from`, takže se její čtení hodin **nikdy neshoduje**
s tím, co po ní následuje (`to`), a fightTime tu hranici uřízne dřív. Přes obrazovku je ta
větev nedosažitelná. Nechal jsem ji tam jako pojistku (`logEvent` umožňuje čas přepsat)
a zamkl testem přímo nad kontraktem reducerů.

**Ověření oprav:** 13 mutací spuštěno v kopii repa mimo pracovní strom, **všech 13
zčervenalo**. Nové testy tedy hlídají, ne jen svítí zeleně.
