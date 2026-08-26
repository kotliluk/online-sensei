---
id: 008
slug: tournament-tests
title: Testy turnajového postupu a dalších nehlídaných míst
status: done
branch: tournament-tests
---

# Testy turnajového postupu a dalších nehlídaných míst

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Kritik testů nezůstal u úvahy — zkopíroval
repo mimo pracovní adresář, zmutoval kód a spustil sadu. **Ze 46 mutací jich 31 přežilo.**

Jeden ze čtyř ticketů podle dělení uživatele. Testy jsem z jeho „testy/konzistence/lint"
oddělil od úklidu schválně: tohle je nejcennější položka z celé revize a smíchané
s mazáním mrtvého kódu se to bude reviewovat jako úklid.

### 2026-08-26

Ticket 007 se mezitím zmergoval a sebral tomuhle ticketu velký kus rozsahu. Než jsem začal
psát, pustil jsem **22 mutací ze seznamu níž proti aktuálnímu `main`** (kopie repa mimo
pracovní strom, `npx vitest run` na každou z nich):

**Zčervenalo už dnes (11)** — postup pavoukem oběma směry, celá kaskáda „kdo vyhrál"
(fauly, body, senchu, remíza jen ve skupině), `saveToLS`, zápis defaultu zpátky do
`localStorage`, `isBetweenValidator`, `skipLastPause`, `advancedRounds` a `restart()`
s novým callbackem. To všechno zavřel ticket 007 cestou k opravám a **není tu co
dodělávat.**

**Přežívá (11)** — a jen tohle zbývá:

| #   | Mutace, která dnes projde zeleně                                         | Kam test přijde                       |
| --- | ------------------------------------------------------------------------ | ------------------------------------- |
| 3   | `updateRepechageTree` vrátí vstup — repasáž se nikdy nepřepočítá         | `types/tests/tournament.test.ts`      |
| 4   | `needsConfirmationToReopen` vrátí vždy `false`                           | tamtéž                                |
| 5   | `isValidFight` vrátí vždy `true`                                         | tamtéž                                |
| 10a | `PausableTimeout.resume()` počítá od začátku, ne od zbytku               | `logic/timing/tests/`                 |
| 10b | `PausableInterval.pause()` nezapočítá uplynulý čas                       | tamtéž                                |
| 10c | `PausableStopwatch.pause()` zahodí naběhaný čas                          | tamtéž                                |
| 10d | `PausableStopwatch.stop()` nevynuluje naběhaný čas                       | tamtéž                                |
| 11a | Výsledky stopek nedělí místa při shodném čase                            | `groupStopwatch/results/tests/`       |
| 11b | Export bere jiné pořadí, než je zobrazené                                | tamtéž                                |
| 12  | `buildAppUrl` zapomene `config.basename` — odkazy mimo `/online-sensei/` | `logic/urlState/tests/appUrl.test.ts` |
| 13  | `ShareButton` hlásí úspěch, i když schránka promise odmítne              | `shareButton/tests/`                  |

**Poznámka k metodě:** první běh censusu jsem pustil s `npx vitest run --silent`, což tenhle
vitest neumí — CLI spadne na parsování argumentu, sada se vůbec nespustí a detekce podle
textu výstupu hlásila nesmysly. Verdikt se teď bere z **návratového kódu** procesu, ne
z toho, co je vidět. Stálo to jeden zahozený běh; kdyby se to nechytlo, ticket by se opíral
o census, který nikdy nic nespustil.

Bod 13 stojí za komentář: ticket 007 tu hlášku otestoval, ale jen pro větev, kde
`navigator.clipboard` **vůbec není** (synchronní `TypeError`). Větev, kde schránka existuje
a `writeText` odmítne, nemá test žádný — a to je ta, na kterou se narazí, když uživatel
zamítne dialog s oprávněním.

**Co z toho plyne pro rozsah:** odhad „~450 řádků testů" byl na celý seznam. Zbývá zhruba
polovina, zato ta těžší — pauzovací aritmetika tří tříd z `logic/timing/` je přesně to
místo, kde se hodiny v tomhle repu pletou. (Ty třídy sice čtou `new Date().getTime()`, ale
`vi.useFakeTimers()` fejkuje i `Date`, takže `advanceTimersByTime` stačí — poznámka o
`setSystemTime()` níž byla zbytečná.)

## B — Zadání

**Problém:** Sada 246 testů je zelená a přitom projde mutace „do dalšího kola postupuje
poražený". Kde testy jsou, jsou dobré — `fightLog` a `urlState` jsou vzor, v celé sadě
není jediný `.skip`, snapshot ani reálný `sleep`. Problém není kvalita, ale rozsah:
`src/redux/` nemá ani jeden testový soubor a turnajová logika se testuje jen ze strany
_stavby_ pavouka, ne jeho _postupu_.

**Rozsah:** Testy nad logikou, kde by chyba na turnaji bolela nejvíc, seřazeno podle ceny.
Žádná změna produkčního kódu — kromě případů, kdy je logika zamčená v komponentě a levnější
je ji vytáhnout do čisté funkce, než testovat obrazovku.

**Mimo rozsah:**

- Opravy samotných bugů → ticket 007. Tady se testuje kód **tak, jak je**; kde ticket 007
  něco opravil, test to jen zamkne.
- Honění procent pokrytí. Cílem není mít všechno otestované, ale zavřít místa, kde mutace
  prochází zeleně.
- SCSS, triviální komponenty, `atoms/`, ikony, překlady.
- Konzistence a mrtvý kód → ticket 010.

**Akceptační kritéria:**

Měřítkem je **mutace, ne pokrytí**. U každé odrážky platí: zmutuj popsanou věc a aspoň
jeden test musí zčervenat.

Odškrtnuto 2026-08-26 po změřeném běhu — šest položek zavřel cestou ke svým opravám už
ticket 007 (postup pavoukem, kaskáda „kdo vyhrál", `saveToLS`, `isBetweenValidator`,
skladba intervalů), zbytek tenhle ticket.

- [x] Postup pavoukem: prohození vítěze tak, aby postupoval poražený, shodí test.
- [x] Nezapsání výsledku do stromu vůbec shodí test.
- [x] Vypnutí celé repasáže (`updateRepechageTree` vrátí vstup) shodí test.
- [x] Zrušení varování před znovuotevřením (`needsConfirmationToReopen` vrátí `false`)
      shodí test.
- [x] `isValidFight` vracející vždy `true` shodí test.
- [x] Kaskáda „kdo vyhrál" (5 faulů, body, senchu, remíza jen ve skupině) je pokrytá
      po větvích.
- [x] `saveToLS`, které nezapíše nic, shodí test. Neplatná hodnota se nahradí defaultem
      **a default se zapíše zpátky**. Rozbitý JSON spadne na default.
- [x] `isBetweenValidator` převedený na ostré nerovnosti shodí test.
- [x] Skladba intervalů: prohození `skipLastPause` shodí test; `range(advancedRounds)`
      → `range(1)` shodí test.
- [x] Pauzovací aritmetika všech tří tříd v `logic/timing/`: běž, pauzuj, posuň čas,
      pokračuj — callback padne po zbylém intervalu, ne dřív a ne znovu od začátku.
- [x] Výsledky stopek: zrušení dělených míst shodí test; export v jiném pořadí, než je
      zobrazené, shodí test.
- [x] `buildAppUrl` bez `config.basename` shodí test.
- [x] `ShareButton`, který při selhání hlásí úspěch, shodí test.

**Technicky** (malá dráha co do rizika, ale ~450 řádků testů):

Seznam mutací, které dnes procházejí zeleně, i s tím, co přesně se mutovalo:
[report z revize](https://claude.ai/code/artifact/41b49176-0f80-4a4c-9c69-3a3796bb2d22).

- **Kam to přijde:** `src/types/tests/tournament.test.ts` (existuje, rozšířit),
  nové `src/logic/localStorage/tests/access.test.ts`,
  `src/redux/intervalTimer/tests/actions.test.ts`, `src/logic/timing/tests/` (tři malé
  soubory), `src/logic/urlState/tests/appUrl.test.ts`.
- **Vzor:** `src/logic/fightLog/tests/` a `src/logic/urlState/tests/` — jednotkové testy
  nad čistou funkcí, `test.each` s pojmenovanými poli, konkrétní asserty.
  Konvence drží `CLAUDE.md`.
- ~~**`logic/timing/` chce `vi.setSystemTime()`**~~ — **neplatí.** `vi.useFakeTimers()`
  fejkuje ve výchozím nastavení i `Date`, takže `advanceTimersByTime()` posune i to, co ty
  třídy čtou přes `new Date().getTime()`. Hotové testy `setSystemTime` nepoužívají.
- ~~**`FightResultModal`**~~ — **udělal to ticket 007**, který šel první. Tady se na to jen
  navázalo, takže tenhle ticket **nemění produkční kód vůbec**. Původní znění:
  vytáhnout `defaultWinner(fight, tournamentType)` do čisté funkce
  a testovat ji přes `test.each`; modál pak jen zobrazuje, co vrátí. To je jediný povolený
  zásah do produkčního kódu v tomhle ticketu a překrývá se s ticketem 007 — udělat to
  **v tom, který půjde první**, a ve druhém na to jen navázat.
- **Ověřit mutacemi.** Po dopsání zkopírovat repo mimo pracovní adresář, zmutovat a spustit;
  cíl je, aby ze seznamu výše zčervenalo všechno. Repo má na tenhle postup precedent
  v ticketech 001–006. **Nikdy nemutovat kód v pracovním adresáři.**

**Rizika a zařízení:** netýká se.

**Předpoklady:**

- `exportFile` a `ShareButton` se testují v jsdomu se stubnutými `URL.createObjectURL`
  a `navigator.share`. Takový test **není důkaz, že to projde na telefonu** — hlídá jen
  rozhodovací větev (sdílet vs. stáhnout, `AbortError` vs. ostatní) a to, že revokace
  nepřijde dřív než po `REVOKE_DELAY`. Chování zařízení zůstává v „Ověřeno na", ne
  v zeleném běhu.

## Review

Branch: `tournament-tests` · revieweři: `correctness`, `tests`. Jen dva schválně —
diff jsou skoro samé testy, takže `react-state` a `device-ux` by neměly na čem pracovat
(žádný hook, žádné `navigator.*`, žádné SCSS, žádný nový text). `tests` tady dělá hlavní
práci, `correctness` hlídá jedinou věc, kterou kritik testů nehlídá: **jestli ty testy
tvrdí o produkčním kódu pravdu.**

Kritik testů pustil vlastní census 40 mutací **mimo** můj seznam. **27 z nich přežívalo.**
To je hodnota téhle fáze v jednom čísle: můj seznam byl uzavřený, jeho ne.

**Opravit (90–100)**

- [major] `types/tests/tournament.test.ts` · repasážní linka delší než jeden zápas nebyla
  vidět — `bracketOfEight` dá semifinalistovi vždy dva přemožené, takže rekurzivní větev
  `createRepechageLine` nikdy neběžela. Vypnout stohování i prohodit v něm rohy prošlo
  zeleně → `bracketOfSixteen` a tři testy · **✅ opraveno**
- [major] `types/tests/tournament.test.ts` · zápis výsledku do `REPECHAGE_2` nehlídalo nic;
  zahodit ho prošlo zeleně → test na druhou linku a test, že hraní jedné nesmaže druhou
  · **✅ opraveno**
- [major] `groupStopwatch/results/tests/` · sestupné řazení, řazení podle jména a vazba
  hlavičky na sloupec byly mrtvé — čtyři mutace prošly zeleně → `test.each` přes hlavičky
  a počty kliků · **✅ opraveno**
- [major] `groupStopwatch/results/tests/` · u exportovaného souboru se kontroloval jen
  obsah. Konstantní název i `text/plain` místo `text/csv` procházely — a podle typu se
  rozhoduje, jestli soubor vůbec půjde sdílet přes systémový share sheet · **✅ opraveno**
- [major] `types/tests/tournament.test.ts` · `isValidFight` šel z poloviny vykuchat.
  Tabulka sahala vždy jen na jednu stranu z dvojice, takže smazání kontroly `redFouls`,
  `bluePoints`, `blueName`, `type` i `oppositeFight` procházelo — a zúžení senchu na dvě
  hodnoty taky → jeden případ na jednu kontrolu, plus všechny tři senchu zvlášť
  · **✅ opraveno**
- [minor] `logic/timing/tests/pausableTimeout.test.ts` · komentář odkazoval na ticket 011,
  ve kterém ten nález nebyl. Pin bez záznamu se z „dočasně zamčené chyby" stane specifikací
  → nález dopsán do 011, mrtvé `isPaused()`/`isRunning()` do 010 · **✅ opraveno**
- [minor] `types/tests/tournament.test.ts` · holé `.toThrow()` projde na jakoukoli výjimku
  → `.toThrow(TypeError)` · **✅ opraveno**
- [minor] `groupStopwatch/results/tests/` · hlavička CSV se v testu odřezávala, takže
  prohozené názvy sloupců procházely · **✅ opraveno**
- [minor] `common/shareButton/tests/` · hláška, která nikdy nezmizí, procházela zeleně —
  a `MESSAGE_TIMEOUT` má nad sebou komentář vysvětlující, proč je zrovna 5 s
  · **✅ opraveno** (fake timers). Úklid timeoutu při odmountování otestovaný **není**:
  cokoli, co to v jsdomu asertuje, je špion na `clearTimeout` ověřující, že kód volá
  `clearTimeout`.
- [minor] `types/tests/tournament.test.ts:541` · komentář tvrdil, že všechny validátory
  v tom souboru padají na `null`. `isValidTournamentTree` ne, a schválně — `null` je tam
  legitimní hodnota · **✅ opraveno**
- [minor] `tickets/008` · zadání tvrdilo, že `logic/timing/` potřebuje `vi.setSystemTime()`.
  Nepotřebuje, `useFakeTimers()` fejkuje i `Date` — hotové testy to samy vyvracely.
  K tomu neodškrtnutý checklist a odrážka o vytažení `defaultWinner` jako „jediném
  povoleném zásahu do produkčního kódu", který ale udělal už ticket 007 · **✅ opraveno**
- [minor] `types/tests/tournament.test.ts:494` · název testu „asks about a semifinal, which
  the repechage is built out of" platil jen pro pavouk od osmi · **✅ opraveno** (zúženo)

**Zvážit (80–89) — nechal jsem na tobě**

- **Ve čtyřčlenném pavouku se dialog ptá na repasáž, která nevznikne.**
  `needsConfirmationToReopen` vrací pro semifinále `true` bezpodmínečně
  (`types/tournament.ts:377`) a `ReopenTreeFightModal` k tomu podle `depth === 1` vybere
  text „Repasáž bude resetována". U čtyř závodníků ale `createRepechageLine` s jedním
  soupeřem vrací `null` — repasáž neexistuje. Je to přesně to učení lidí proklikávat
  dialogy, proti kterému je ta funkce napsaná. **Neopravoval jsem to:** tenhle ticket
  produkční kód nemění a je to změna toho, co vidí rozhodčí u stolku. Zapsané v komentáři
  u testu.
- **Sedm mutací pořád přežívá a nechal jsem je.** Dvojí `pause()` (chybí stráž, uplynulý
  čas se odečte dvakrát), `lastStart` ve `stop()`, `Math.max(remaining, 0)` v `resume()`,
  prohozené `isPaused()`/`isRunning()` — a popisek „Sdílet / Stáhnout" na tlačítku CSV.
  První čtyři jsou vnitřnosti tříd, které ticket 011 přepíše (a `isPaused()` nevolá vůbec
  nikdo — proto míří do 010, ne sem). Popisek se řídí `willShareFile`, tedy zařízením:
  test by mockoval vlastní předpoklad, patří to do „Ověřeno na". `findParentFightFor`
  s omezením hloubky vypadá na ekvivalentní mutaci — s unikátními uuid najde stejného
  rodiče tak či tak.

## D — Hotovo

**Co se změnilo.** Nic v produkčním kódu — ani řádek. Přibylo 69 testů (363 → 432)
v pěti nových souborech a ve dvou rozšířených.

**Akceptační kritéria.** Všech třináct odškrtnuto v `B`, každé měřením: **šest** z nich
zavřel cestou ke svým opravám už ticket 007 a zbylých **sedm** tenhle ticket. Měřítkem
nebylo pokrytí, ale mutace — u každé položky existuje konkrétní změna produkčního kódu,
po které aspoň jeden test zčervená.

**Čísla**

|                                           | main                 | branch                   |
| ----------------------------------------- | -------------------- | ------------------------ |
| Testy                                     | 363 (33 souborů)     | **432** (33 souborů)     |
| Mutace z původního censusu, které přežijí | 11 z 22              | **0 z 22**               |
| Mutace z censusu reviewera, které přežijí | —                    | 0 z 18 ověřených         |
| Lint                                      | 0 chyb / 63 warningů | 0 chyb / **62** warningů |

**Odchylky od zadání**

- **Rozsah se proti zadání zmenšil o polovinu** a rozhodlo o tom měření, ne úvaha. Ticket
  007 se mezitím zmergoval; kdybych psal podle původního seznamu, půlka práce by nezměnila
  nic. Zapsáno v `A` k datu 2026-08-26.
- **Vytažení `defaultWinner` do čisté funkce** bylo v zadání jako jediný povolený zásah do
  produkčního kódu. Udělal to ticket 007, tak tu nebylo co dělat.
- **Dva testy zamykají chybné chování** a oba to říkají v komentáři: vypršelý
  `PausableTimeout` se hlásí jako běžící a při `pause()` + `resume()` vystřelí podruhé;
  `isValidFight(null)` hodí `TypeError` místo `false`. Ani na jedno se v dnešním `src/`
  nedá narazit a obojí je oprava produkčního kódu, kterou ticket zakazuje. Nálezy jsou
  zapsané v ticketech 011 a 010, aby pin nezůstal viset na odkazu, který nikam nevede.

**Gotchas pro příště**

- **`npx vitest run --silent` tenhle vitest neumí** — CLI spadne na parsování argumentu,
  sada se vůbec nespustí a výstup neobsahuje ani „FAIL", ani „failed". Detekce podle textu
  výstupu pak hlásí, že mutace přežila, u všeho. **Verdikt ber z návratového kódu.**
- **Vlastní seznam mutací je vždycky uzavřený.** Můj měl 22 položek a všechny umřely;
  reviewer pustil 40 jiných a 27 z nich přežívalo. Census je dobrý na to, aby se nedělalo,
  co je hotové — ne na to, aby prohlásil věc za pokrytou.
- **`vi.mock('uuid')` na konstantu znamená, že v tom souboru nejde stavět stromy produkčním
  kódem.** Všechny fighty vyjdou se stejným uuid a `updateTournamentTree` matchne první
  uzel, na který narazí. Stromy v `tournament.test.ts` se proto píšou ručně s explicitními
  uuid — dvakrát jsem na to narazil, než mi došlo, že to je ono.
- **`vi.useFakeTimers()` fejkuje i `Date`**, takže třídy čtoucí `new Date().getTime()`
  testovat `setSystemTime()` nepotřebují. Byl to můj předpoklad v zadání a byl špatně.

**Ověřeno na**

- **Testy:** 432 ve 33 souborech, typecheck čistý, lint 62 warningů a 0 chyb (main 63).
- **Mutačně:** 22 mutací z původního censusu i 18 z reviewerova — všech 40 zčervená.
  Pouštěno v kopii repa mimo pracovní strom, verdikt z návratového kódu.
- **Na telefonu netřeba** a schválně: tenhle ticket nemění produkční kód, takže na
  zařízení nemá co ověřovat. Jediné, co se zařízení dotýká, je popisek „Sdílet / Stáhnout"
  na exportu výsledků — a ten schválně nemá test, protože se řídí `willShareFile`.
