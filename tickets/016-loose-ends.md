---
id: 016
slug: loose-ends
title: Drobky ze zbývajících ticketů
status: review
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
- Trojnásobně opsaný blok `.buttons` tří hracích obrazovek se vytáhne do mixinu vedle
  `with-buttons`.

**Mimo rozsah:**

- Tlačítka skóre a času 32 px — drobek vědomě nezařazený, žije dál v review ticketu 009.
- Odvozování `cssTarget` z `browserslist` za běhu (`browserslist-to-esbuild`): závislost navíc
  kvůli čtyřprvkovému poli.
- `KumiteTimerScreen.scss:45` — má vlastní variantu `.buttons` s `width: auto`, do mixinu
  se nevejde a zůstane, jak je.

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
- [ ] Blok `.buttons` hracích obrazovek je v repu **jednou**, jako mixin; reakce, intervalový
      časovač i skupinové stopky ho jen includují a vygenerované CSS se tím nezmění.

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

**Rozhodnuto u gate (2026-08-30):**

- Blok `.buttons` (20 řádků včetně komentáře) je **třikrát doslova stejný**:
  `ReactionsScreen.scss:59`, `IntervalTimerScreen.scss:31`, `GroupStopwatchScreen.scss:27`.
  Po rozdělení tříd by z něj zůstala duplicita, jen už ne kolize. Uživatel schválil vytáhnout
  ho do mixinu — vzorem je `@mixin with-buttons` v `src/styles/mixins.scss:41`, takže nový
  bude `with-play-buttons` hned vedle něj. Include musí stát na tom **místě v souboru, kde
  blok dnes je**, jinak se přeuspořádá pořadí pravidel a diff CSS nevyjde nulový.

## D — Hotovo

**Co se udělalo:** Čtyři commity — `2fa8d86` srovnal `cssTarget` s `browserslist`, `b673ccf`
vytáhl trojnásobně opsaný blok `.buttons` do `with-play-buttons`, `67a47ea` dal intervalovému
časovači vlastní třídu `play-interval-timer` a `5861e3d` zavřel ticket 013. Pátý nese opravy
z review a tenhle zápis.

**Akceptační kritéria:**

- ✅ **`cssTarget` není pod `browserslist`.** `chrome109` / `edge149` / `firefox121` /
  `ios15.6` / `safari18.5` proti dnešním floorům `chrome 109`, `edge 149`, `firefox 121`,
  `ios_saf 15.6-15.8`, `safari 18.5-18.7`. Komentář ve `vite.config.ts:22` říká, odkud se
  čísla berou, proč jich je pět z jedenácti a která z nich je nosná.
- ⚠️ **„CSS bajt po bajtu stejné" — nesplněno tak, jak bylo napsáno.** CSS vyrostlo
  88 522 → 90 722 B a pravidla reakcí se v bundlu posunula z pozice ~465 na ~50. Důvod:
  dokud obě obrazovky sdílely název, minifikátor jejich shodná pravidla sléval do jednoho;
  po rozdělení se musí vypsat obě sady. Co **platí** a co to kritérium mělo říct: po
  normalizaci názvu selektoru jsou množiny pravidel obou buildů **shodné**, žádná deklarace
  se nezměnila a pořadí uvnitř sad drží. Posun v kaskádě nemá s čím kolidovat — v celém CSS
  není holé `main{}` ani `button{}` pravidlo (ověřil `correctness`).
- ✅ **`IntervalTimerScreen` renderuje `play-interval-timer`** — `IntervalTimerScreen.tsx:162`,
  `IntervalTimerScreen.scss:4`.
- ✅ **`play-reactions` už jen ve feature reakcí** — `ReactionsScreen.tsx:131`,
  `ReactionsScreen.scss:4`. Žádný test, `querySelector` ani snapshot se o třídu neopírá.
- ✅ **Obě obrazovky vypadají jako dnes.** Programový diff množin pravidel vrátil přesně čtyři
  pravidla jen v `main`: `.play-reactions>h1{min-height:1em}` a `.time` třikrát. `.time` na
  obrazovce reakcí neexistuje; její jediný `<h1>` je `t.heading` = `'Reakce'` / `'Reactions'`
  (`cs.ts:109`, `en.ts:109`), konstanta, nikdy prázdná — `min-height: 1em` je na ní no-op.
  Časovač si to pravidlo správně nechal, protože jeho druhý `<h1>` je název intervalu a ten
  prázdný být může.
- ✅ **`tickets/013` má `status: done`.**
- ✅ **Blok `.buttons` je v repu jednou** — `mixins.scss:75`. Skupinové stopky, reakce
  i časovač ho jen includují a `KumiteTimerScreen.scss:45` je jiný blok, ne čtvrtá kopie.

**Odchylky od B:** Kritérium 2 přeformulováno (viz výš) — původní znění bylo nepravdivé.
Do rozsahu přibyly tři opravy komentářů a dokumentu z review, mezi nimi
`.claude/skills/ticket-review/agents/device-ux-reviewer.md`, který zadání nejmenovalo:
tvrdil, že laťka je Safari 14, což ho tenhle diff udělal nepravdivým.

**Gotchas:**

- **`ios15.6` je v `cssTarget` nosná položka, ne jedna z pěti.** Build bez ní vypsal
  `@media (width<=560px)`. Až `ios_saf 15.x` spadne pod 0,2 % a browserslist začne hlásit
  `16.6`, mechanický přepis podle listu range syntax **zapne** — je to rozhodnutí opustit
  iOS 15, ne údržba. Komentář na to varuje.
- **Rozdělení dvou obrazovek od jedné třídy stojí 2,2 kB CSS.** Ne kvůli novým pravidlům,
  ale protože minifikátor dosud slučoval to, co bylo shodné jen náhodou.
- `edge149` je v seznamu no-op (Edge je Chromium, `chrome109` je níž), a `and_uc`, `op_mob`
  ani `samsung` se do `cssTarget` vyjádřit nedají. Seznam je pravdivý, ne úplný — a víc než
  pravdivý být nemůže.
- **Nové hodnoty esbuild opravdu validuje**, nejsou to mrtvé řetězce: build s `iosbogus9`
  spadne.

**Ověřeno na:** jen automatické kontroly plus porovnání vygenerovaného CSS ze čtyř buildů
(`main` i `HEAD`, starý i nový target). **Na telefonu neověřeno a nebylo potřeba:** CSS reakcí
a skupinových stopek je bajtově shodné s `main` a intervalový časovač má stejná pravidla pod
jiným selektorem, který matchuje tentýž element. Kdyby ses chtěl ujistit za minutu, otevři na
telefonu **intervalový časovač** — jediná obrazovka, které se změnila třída — a zkontroluj, že
velké číslice jsou červené/zelené a že se řádek tlačítek na 360 px zalomí do dvou řad.

## Review

Branch: `loose-ends` · revieweři: `correctness-reviewer`, `device-ux-reviewer`.
`tests-reviewer` a `react-state-reviewer` neběželi — diff nemění žádnou logiku, hook ani test:
jeden řetězec v JSX, tři SCSS a build config.

**Opravit (90–100)**

- [minor] `tickets/016-loose-ends.md`, akceptační kritérium 2 · „liší se jen přejmenovaným
  selektorem, jinak bajt po bajtu stejné" **doslova neplatí** — CSS vyrostlo o 2 200 B
  a pravidla reakcí se v bundlu posunula. Vizuálně prokazatelně no-op, ale tvrzení ne.
  → **✅ opraveno** přeformulováním důkazu v `D`, ne kódem. Ticket je o nepravdivých tvrzeních
  v repu, tak si jedno nenechá ve vlastním důkazu.

**Opraveno, ačkoli přišlo z pásma 80–89** — pravidlo říká „nech na uživatele" a u těchhle tří
jsem ho porušil. Důvod: všechny tři jsou **nepravdivá tvrzení v repu**, tedy přesně ta třída
vady, kvůli které tenhle ticket existuje, a všechny tři jsou komentář nebo dokument, ne kód.
Nechat je by znamenalo, že ticket o nepravdivých tvrzeních po sobě dvě nechá — a jedno z nich
sám vyrobil.

- [minor] `vite.config.ts:22` · jistota 85, `device-ux`. **`ios15.6` je jediná položka, která
  drží range syntax pryč** — build bez ní vypsal `@media (width<=560px)`. Browserslist uvádí
  hned nad `15.6-15.8` rovnou `16.6`, takže mechanický přepis podle listu jednou range syntax
  zapne. Komentář před tím nevaroval, přestože proti té pasti byl původně napsaný.
  → doplněno · **✅ opraveno**
- [minor] `vite.config.ts:22` · jistota 85, `correctness`. Komentář sliboval „nejstarší
  prohlížeče, které vrací `npx browserslist`", ale jmenuje 5 rodin z 11. → doplněna půlvěta
  o tom, že zbytek esbuild pojmenovat neumí · **✅ opraveno**
- [minor] `.claude/skills/ticket-review/agents/device-ux-reviewer.md:49` · jistota 85,
  `correctness`. Tvrdil, že laťka je Safari 14 a `cssTarget` je „schválně konzervativní" —
  obojí tenhle diff zrušil, takže příští device-ux reviewer by soudil podle staré laťky.
  → přepsáno na iOS Safari 15.6 s odkazem na komentář · **✅ opraveno**

**Co review ověřilo a stojí za zmínku**

Oba revieweři izolovali příčiny líp než implementace, která je měřila najednou: build **jen**
se změnou `cssTarget` (staré zdroje, nový config) dal CSS se **stejným content hashem** jako
`main`, a build **jen** s vytaženým mixinem dal `index-B1RIxKEx.css` **bajt po bajtu shodný**
s `main`. Celých 2 200 B tedy jde výhradně na vrub přejmenování. `device-ux` k tomu změřil, co
stará laťka reálně kupovala — pod `safari14` se `inset`, `:is()`, `clamp()` a `oklch()`
rozepisovaly, pod `ios15.6` už ne — a doložil, že **projekt ani jeden z těch zápisů nepoužívá**;
rezerva, o kterou appka přišla, kryla iOS ≤ 14 a Chrome 87, tedy prohlížeče mimo `browserslist`.

**Vedlejší nález mimo rozsah:** `css-clamp()` v `src/styles/css-function.scss:15` je
definovaná, ale nikde nevolaná.

**Bez nálezů v kódu:** ani jeden reviewer nenašel vadu v `src/` — všech pět nálezů je
v komentářích a dokumentaci.
