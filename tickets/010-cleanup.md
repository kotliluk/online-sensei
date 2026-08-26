---
id: 010
slug: cleanup
title: Úklid mrtvého kódu, duplicit a konzistenčních odchylek
status: spec
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

<!-- doplní /ticket-review -->
