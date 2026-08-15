---
id: 001
slug: fight-log
title: Log průběhu kumite zápasu
status: review
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

| Dílčí věc              | Stav        | Kde to žije / co reusnu                                     |
| ---------------------- | ----------- | ----------------------------------------------------------- |
| Entita zápasu          | ✅ existuje | `src/types/tournament.ts:32` — `Fight`, plus operace v témže souboru (vzor „typy a jejich operace pohromadě") |
| Persistence s fallbackem | ✅ existuje | `src/logic/localStorage/access.ts:77` — `getValidatedTypeFromLS` |
| Validace uloženého tvaru | ✅ existuje | `isValidFight` `tournament.ts:116`                          |
| Formátování času        | ✅ existuje | `parseTime` `src/utils/time.ts:23`                          |
| Doplňování parametrů do textů | ✅ existuje | `insertWords` `src/logic/translation/index.ts:25`      |
| Kontrolovaný state      | ⚠️ částečně | `useControlledState` hodnotu mimo limit tiše zahodí a neřekne to |
| Sběr událostí           | ❌ chybí    | nový `src/types/fightLog.ts`                                |

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

**Co se udělalo:** Commit `fee3ffe`, 15 souborů, +850/−30. Čistá `appendFightEvent`,
panel na obrazovce, log na entitě zápasu včetně persistence a prohození stran u skupiny.
28 unit testů nad `src/types/fightLog.ts` (sada celkem 98) a 15 browser testů (sada
celkem 63, žije mimo repo — viz bod 3 v `TODO.md`).

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
- Uložení turnajového zápasu **skončí na set-up obrazovce**, ne na tabulce — musí se přes
  „Pokračovat turnaj". Ověřeno proti nasazenému mainu, takže preexistující. Zapsáno
  v `TODO.md`.
- Řada tlačítek časomíry (`KumiteTimerScreen.scss:45`) je flex **bez zalomení**. Se čtyřmi
  tlačítky přetéká telefon (~544 px na 412); páté z fáze 2 to zhorší. `flex-wrap: wrap`
  patří před fázi 2.

**Ověřeno na:** **Jen desktop Chrome** (Playwright, 63/63) a emulovaný viewport 412×915 —
což je rozlišení, ne zařízení. Na reálném telefonu **neověřeno**. Prohlížečových API se
změna nedotýká, takže riziko je jen layoutové: čitelnost panelu, jeho vlastní scroll
a to, jestli nezhorší už tak přetékající řadu tlačítek u turnajového zápasu.

## Review

**Neproběhla.** Kód vznikl před tímhle flow, žádný z reviewerů (`correctness`,
`react-state`, `device-ux`, `tests`) neběžel. Podle tabulky ve `ticket-review` by se na
tenhle diff hodili všichni čtyři — sahá na `src/types/` i na `src/components/`, hooky
a efekty, a přidává texty do obou jazyků.
