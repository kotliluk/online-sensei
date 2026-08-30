---
id: 016
slug: loose-ends
title: Drobky ze zbývajících ticketů
status: spec
branch: loose-ends
---

# Drobky ze zbývajících ticketů

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-28

Z přehledu zbývající práce po mergi ticketu 009. Uživatel:

„zapiš vite.config.ts:26 a .play-reactions do 016, kam budeme zatím odhazovat drobky ze
zbývajících 4 ticketů a uděláme je pak najednou"

Tenhle ticket je **sběrné místo**, ne jedna změna. Patří sem nálezy, které jsou samy o sobě
moc malé na vlastní ticket a nespadají do rozsahu žádného z běžících (010–013). Sekce `B`
se napíše, až se nasbírá dávka, kterou má smysl udělat najednou — do té doby se sem jen
připisují další drobky, každý s datem a s ukotvením na `path:line`.

**Drobek 1 — `vite.config.ts:26`: deklarovaný cíl buildu si protiřečí s `browserslist`.**

`cssTarget` obsahuje `'safari14'`, zatímco `npx browserslist` hlásí jako nejstarší cíl
`ios_saf 15.6`. Pod tou laťkou jsou `aspect-ratio`, `gap` ve flexu i `:focus-visible` —
tedy věci, které ticket 009 do repa vědomě zavedl. Build se tím nemění (esbuild nic
nepolyfilluje ani nevaruje), nepravdivý je jen deklarovaný kontrakt; komentář u něj navíc
mluví o něčem jiném (přepis media queries do range syntaxe, kterou Safari umí až od 16.4).

Volba je mezi „zvednout `cssTarget` na `safari15`" a „nechat a doplnit fallbacky" — a to je
rozhodnutí o build configu, ne oprava. Zdroj: review ticketu 009, `device-ux`, jistota 90.

**Drobek 2 — `.play-reactions` stylují dvě různé obrazovky.**

`IntervalTimerScreen.scss:4` i `ReactionsScreen.scss` cílí na tutéž třídu, protože obě
obrazovky renderují `<main className='play-reactions'>`. Preexistující copy-paste; dnes to
nic nerozbíjí (ticket 009 do obou přidal identický blok), ale ty dvě obrazovky si navzájem
přebíjejí styly a příští změna jedné tiše sáhne na druhou. Zdroj: review ticketu 009,
`device-ux`, jistota 82.

**Nezařazeno vědomě:** třetí nález ze stejného review — tlačítka skóre a času zůstala
32 × 32 px, zatímco kolečka faulů jsou po ticketu 009 48 px, takže častěji používaný prvek
je menší než ten vzácnější. Uživatel ho sem nezařadil; je to vizuální rozhodnutí, ne
nekonzistence v kódu. Žije dál v sekci `Review` ticketu 009.

### 2026-08-30

„jdeme na 016 - v rámci něho oprav stav 013 na done"

**Drobek 3 — `tickets/013-interval-reorder-touch.md` má po mergi pořád `status: review`.**

Ticket se mergnul do `main` dřív, než se stav překlopil. `status:` je jediný zdroj pravdy
o tom, kde ticket stojí, takže by ho příští `/ticket 013` četl jako čekající na review.
Opravit to rovnou na `main` nejde (commity na `main` jsou zablokované), tak to jede
s touhle dávkou.

## B — Zadání

**Problém:** Tři místa, kde repo o sobě tvrdí něco, co neplatí. Na obrazovce z toho uživatel
nevidí nic — pálí to příštího čtenáře (i příští session), který tomu tvrzení uvěří:
`vite.config.ts` deklaruje cíl buildu pod laťkou `browserslist`, dvě různé obrazovky se perou
o jednu třídu, a ticket 013 zůstal ve `status: review`.

**Rozsah:**

- `vite.config.ts` — `cssTarget` sedí na tom, co doopravdy hlásí `npx browserslist`, a komentář
  u něj vysvětluje čísla, která tam stojí.
- Intervalový časovač dostane vlastní třídu `play-interval-timer`; `.play-reactions` zůstane
  jenom reakcím.
- `tickets/013-interval-reorder-touch.md` — `status: review` → `done`.

**Mimo rozsah:**

- Tlačítka skóre a času 32 px — drobek vědomě nezařazený, žije dál v review ticketu 009.
- Odvozování `cssTarget` z `browserslist` za běhu (`browserslist-to-esbuild`): závislost navíc
  kvůli čtyřprvkovému poli.
- Vytažení sdíleného bloku `.buttons` do mixinu — viz otevřená otázka.

**Akceptační kritéria:**

- [ ] Žádná hodnota v `cssTarget` není pod tím, co hlásí `npx browserslist` (dnes nejstarší
      WebKit je `ios_saf 15.6`), a komentář u ní říká, odkud se ta čísla berou.
- [ ] `yarn build` vyprodukuje CSS, které se od dnešního liší **jen** přejmenovaným
      selektorem — jinak bajt po bajtu stejné.
- [ ] `IntervalTimerScreen` renderuje `<main className='play-interval-timer'>` a jeho SCSS cílí
      na tutéž třídu.
- [ ] Řetězec `play-reactions` je v `src/` už jen ve dvou souborech feature reakcí.
- [ ] Obě obrazovky vypadají jako dnes. Jediné pravidlo, které reakce od časovače dosud
      přebíraly a mohlo je ovlivnit, je `& > h1 { min-height: 1em }` — a jejich `<h1>` má vždy
      text (`t.heading`), takže se neprojeví. Zbytek (`.time`, `.signal-boxes`) na cizí
      obrazovce nemá co chytit.
- [ ] `tickets/013` má `status: done`.

**Postup (malá dráha, `C` se nepíše):**

- Mění se `vite.config.ts`, `IntervalTimerScreen.tsx` + `.scss` a `tickets/013`. Nic nového
  nevzniká.
- Název třídy drží konvenci obrazovek v repu (`play-group-stopwatch`,
  `set-up-interval-timer-simple`) → `play-interval-timer`.
- Testuje se **buildem, ne unit testem**: jsdom CSS neaplikuje, takže jediný důkaz, že se
  vzhled nezměnil, je diff vygenerovaného CSS před a po. Existující testy obrazovek musí
  zůstat zelené — ověřím, že žádný neasertuje na třídu `<main>`.
- Na reálném zařízení: **netýká se.** Žádné prohlížečové API, žádný text, žádný nový layout.
  `cssTarget` se dotkne výstupu jen tehdy, když diff CSS vyjde nenulový — a to je pak nález,
  ne hotovo.

**Otevřené otázky:**

- Blok `.buttons` (20 řádků včetně komentáře) je **třikrát doslova stejný**:
  `ReactionsScreen.scss:59`, `IntervalTimerScreen.scss:31`, `GroupStopwatchScreen.scss:27`.
  Po rozdělení tříd z něj zůstane duplicita, jen už ne kolize. Repo má na přesně tohle vzor —
  `@mixin with-buttons` v `src/styles/mixins.scss:41`. Doporučuju vytáhnout ho taky
  (`@mixin play-screen-buttons`): ~40 řádků dolů a komentář o zalamování bude žít jednou.
  Sahá to ale na třetí obrazovku, kterou žádný drobek nejmenuje, tak to nechávám na tobě.
  (`KumiteTimerScreen.scss:45` má variantu s `width: auto`, ta zůstane, jak je.)

## Review

<!-- doplní /ticket-review -->
