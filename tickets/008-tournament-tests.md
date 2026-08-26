---
id: 008
slug: tournament-tests
title: Testy turnajového postupu a dalších nehlídaných míst
status: wip
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
polovina, zato ta těžší — tři třídy z `logic/timing/` chtějí `vi.setSystemTime()`, protože
čtou `new Date().getTime()`, a pauzovací aritmetika je přesně to místo, kde se hodiny
v tomhle repu pletou.

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

- [ ] Postup pavoukem: prohození vítěze tak, aby postupoval poražený, shodí test.
- [ ] Nezapsání výsledku do stromu vůbec shodí test.
- [ ] Vypnutí celé repasáže (`updateRepechageTree` vrátí vstup) shodí test.
- [ ] Zrušení varování před znovuotevřením (`needsConfirmationToReopen` vrátí `false`)
      shodí test.
- [ ] `isValidFight` vracející vždy `true` shodí test.
- [ ] Kaskáda „kdo vyhrál" (5 faulů, body, senchu, remíza jen ve skupině) je pokrytá
      po větvích.
- [ ] `saveToLS`, které nezapíše nic, shodí test. Neplatná hodnota se nahradí defaultem
      **a default se zapíše zpátky**. Rozbitý JSON spadne na default.
- [ ] `isBetweenValidator` převedený na ostré nerovnosti shodí test.
- [ ] Skladba intervalů: prohození `skipLastPause` shodí test; `range(advancedRounds)`
      → `range(1)` shodí test.
- [ ] Pauzovací aritmetika všech tří tříd v `logic/timing/`: běž, pauzuj, posuň čas,
      pokračuj — callback padne po zbylém intervalu, ne dřív a ne znovu od začátku.
- [ ] Výsledky stopek: zrušení dělených míst shodí test; export v jiném pořadí, než je
      zobrazené, shodí test.
- [ ] `buildAppUrl` bez `config.basename` shodí test.
- [ ] `ShareButton`, který při selhání hlásí úspěch, shodí test.

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
- **`logic/timing/` chce `vi.setSystemTime()`, ne jen `advanceTimersByTime`** — ty třídy
  čtou `new Date().getTime()`, takže samotné posunutí timerů nestačí.
- **`FightResultModal`**: vytáhnout `defaultWinner(fight, tournamentType)` do čisté funkce
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

<!-- doplní /ticket-review -->
