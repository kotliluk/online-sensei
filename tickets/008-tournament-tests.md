---
id: 008
slug: tournament-tests
title: Testy turnajového postupu a dalších nehlídaných míst
status: spec
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

## B — Zadání

**Problém:** Sada 246 testů je zelená a přitom projde mutace „do dalšího kola postupuje
poražený". Kde testy jsou, jsou dobré — `fightLog` a `urlState` jsou vzor, v celé sadě
není jediný `.skip`, snapshot ani reálný `sleep`. Problém není kvalita, ale rozsah:
`src/redux/` nemá ani jeden testový soubor a turnajová logika se testuje jen ze strany
*stavby* pavouka, ne jeho *postupu*.

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
