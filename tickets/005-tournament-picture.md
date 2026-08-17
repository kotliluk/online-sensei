---
id: 005
slug: tournament-picture
title: Přehled turnaje jako obrázek
status: analysis
branch: tournament-picture
---

# Přehled turnaje jako obrázek

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-16

Z nápadu k [ticketu 004](./004-tournament-export.md), doslova:

„respektive stažení „grafického" přehledu turnaje by šlo jako stažení obrázku zobrazené
tabulky nebo pavouka"

Na gatu ticketu 004 rozhodnuto: **vlastní ticket, ne součást exportu do CSV.**

### Co už je zjištěné (a jde to proti intuici)

U CSV je jednodušší skupina a složitější pavouk. **U obrázku je to obráceně:**

- **Pavouk je čisté SVG** — `TreeNode.tsx:47` kreslí jen `rect` a `text`, žádný
  `foreignObject`. Obrázek z něj jde udělat serializací do canvasu **bez nové závislosti**
  a v plné šířce pavouka, ne jen toho výřezu, co je vidět na obrazovce.
- **Skupinová tabulka je HTML mřížka** — `GroupTournamentScreen.tsx:48`, se zamrzlým
  řádkem a sloupcem a scrollem. Na její obrázek je potřeba `dom-to-image` nebo podobná
  závislost a stejně se musí vykreslit mimo obrazovku, aby nebyla oříznutá.

Otevřené věci pro zadání: písmo v serializovaném SVG (fallback, když se nepřenese
`font-family`), tmavý motiv, a jestli se obrázek na telefonu chová v `navigator.share`
jinak než CSV — MIME `image/png` je jiný případ než `text/csv` a ten už jednou překvapil.

## B — Zadání

**Problém:** Přehled turnaje se dnes dá stáhnout jen jako CSV, což je formát pro stroj.
Kdo chce turnaj **ukázat** — hodit pavouka do klubového chatu, vytisknout tabulku
a pověsit ji u tatami, poslat rodičům, jak to dopadlo — musí buď otevřít tabulkový
procesor a naformátovat si to sám, nebo poslat screenshot toho, co se zrovna vešlo na
displej. Screenshot je přitom u obou systémů useknutý: pavouk se posouvá a zvětšuje,
skupinová tabulka má zamrzlý řádek a sloupec a scrolluje.

**Rozsah:**

- Na turnajové obrazovce přibude **třetí tlačítko**, které stáhne (nebo nabídne ke
  sdílení) turnaj jako **obrázek PNG**.
- **Celý turnaj, ne výřez.** U pavouka celý strom bez ohledu na to, kam je zrovna
  odscrollovaný a jak je zazoomovaný; u skupiny celá tabulka včetně jmen a dopočtených
  sloupců, i když se na displej nevejde.
- **Repasáž je v obrázku taky**, když existuje — na obrazovce je pod hlavním stromem
  a v obrázku patří na stejné místo.
- Obrázek se **kreslí na světlé pozadí bez ohledu na motiv aplikace**. Odchází z appky
  do chatu, do tisku, do náhledu na Drivu — a nic z toho tmavý motiv nezdědí.

**Mimo rozsah:**

- PDF a tisk. Obrázek se vytisknout dá, formátovat stránku je jiný ticket.
- Obrázek jednotlivého zápasu nebo jeho průběhu.
- Nastavení obrázku — velikost, ořez, co v něm je. Jeden formát, jedno tlačítko.
- Nahrazení CSV přehledu. Zůstává; slouží k něčemu jinému (filtrovat a sčítat).

**Akceptační kritéria:**

- [ ] Na turnajové obrazovce je třetí tlačítko, popisek se řídí zařízením stejně jako
      u zbylých dvou (sdílet / stáhnout).
- [ ] Pavouk: obrázek obsahuje **všechny zápasy stromu**, i ty mimo viditelnou část,
      a spojnice jsou **čáry, ne vyplněné plochy**.
- [ ] Pavouk s repasáží: v obrázku je hlavní strom i repasáž.
- [ ] Skupina: obrázek obsahuje jména v prvním řádku i sloupci, skóre v buňkách
      a všech šest dopočtených sloupců — se stejnými čísly, jaká ukazuje obrazovka.
- [ ] Diakritika ve jménech je v obrázku správně.
- [ ] Obrázek má světlé pozadí i tehdy, když appka běží v tmavém motivu.
- [ ] Turnaj, ve kterém se ještě nic neodehrálo, se stáhnout dá a nespadne.
- [ ] Soubor je `image/png` a jmenuje se ve stejném duchu jako ostatní exporty.
- [ ] Texty v `cs.ts` i `en.ts`.
- [ ] Na telefonu ověří uživatel — sdílení obrázku je jiný MIME než CSV.

**Otevřené otázky:**

1. **Třetí tlačítko, nebo nahradit CSV přehled?** Doporučuju **třetí**. U pavouka je
   obrázek skoro jistě lepší než CSV seznam kol, ale u skupiny je CSV tabulka pořád
   to, v čem jde řadit a sčítat — a to obrázek nikdy neumí. Na 375 px se řada zalomí
   na dva řádky, což je v pořádku (`flex-wrap` tam už je), ale je to viditelná změna.
2. **Rozlišení.** Doporučuju **2×**, ať je to čitelné po zvětšení v chatu a v tisku;
   změřeno na 4 lidech to dělá 1264×484 px a 27 kB, takže velikost není důvod šetřit.
   U 16 lidí to poroste — viz „Rizika".

## C — Analýza

**Analýza je postavená na měření, ne na odhadu.** Tvrzení ze sekce A („pavouk je čisté SVG,
takže obrázek z něj jde bez závislosti") **v naivní podobě neplatí** — první pokus vyrobil
prázdný soubor a druhý černé kaňky místo spojnic. Recept níž je ověřený v prohlížeči
a produkuje [tenhle obrázek](./assets/005-bracket-light.png).

**Reuse / gap:**

| Dílčí věc | Stav | Kde to žije / co reusnu |
| --------- | ---- | ----------------------- |
| Doručení souboru (sdílet / stáhnout) | ✅ existuje | `logic/download/exportFile.ts:69`; `willShareFile` bere MIME jako parametr, takže `image/png` projde beze změny |
| Popisek podle zařízení | ✅ existuje | `TournamentScreen.tsx:38` (`shares`) — třetí tlačítko se přidá do stejné podmínky |
| Razítko a slug do jména souboru | ✅ existuje | `logic/download/fileName.ts` z ticketu 004 |
| Řádek tlačítek | ✅ existuje | `.tournament-export` v `TournamentScreen.scss:12`, `flex-wrap` už tam je |
| Data skupinové tabulky | ✅ existuje | `selectKumiteTimerTournamentGroup` + `groupRowStats` z ticketu 004 |
| Vykreslený pavouk | ✅ existuje | `<svg>` uvnitř `.tree-wrapper` (`TreeTournamentScreen.tsx:61`) |
| SVG → PNG | ❌ chybí | nové, `logic/download/` |
| Kreslení tabulky do canvasu | ❌ chybí | nové |

**Kam to přijde:**

- `src/logic/download/svgToPng.ts` (nový) — `svgToPngBlob(svg, options)`, čistá práce
  s DOM, bez znalosti turnaje.
- `src/logic/tournament/groupPicture.ts` (nový) — nakreslí skupinovou tabulku do canvasu
  z dat.
- `src/components/kumiteTimer/tournamentScreen/TournamentScreen.tsx` + `.scss` — třetí
  tlačítko; potřebuje **ref na `<svg>`** u pavouka, takže `TreeTournamentScreen` bude
  muset ten element ven prozradit (ref přes props, nebo `querySelector` uvnitř handleru —
  viz Předpoklady).
- `src/logic/translation/{translation,cs,en}.ts` — dva klíče (stáhnout / sdílet obrázek).

**Postup — recept na pavouka (ověřený, ne navržený):**

1. **Naklonovat `<svg>`.**
2. **Vlepit vypočtené styly.** Serializovaná kopie s sebou nenese žádný stylopis, takže
   všechno, co je nastavené CSS a ne atributem, se ztratí. Konkrétně spojnice: `<path>`
   nemá `fill` ani `stroke` v atributu, na obrazovce mu je dává CSS (`fill: none`,
   `stroke: rgb(0,0,0)`) — a bez nich se `<path>` vykreslí s výchozím `fill: black`,
   takže **z čar jsou vyplněné plochy**. Změřeno; ukazuje to [`assets/005-links-as-blobs.png`](./assets/005-links-as-blobs.png)
   to ukazuje. Stačí projít `[svg, ...svg.querySelectorAll('*')]` a naklonovaným prvkům
   nastavit `fill`, `stroke`, `stroke-width`, `font-family`, `font-size`, `font-weight`
   z `getComputedStyle`. **Písmo se tím vyřeší taky** — `font-family` je jen v CSS.
3. **Spočítat ořez z bbox _a_ transformace.** Tohle je krok, jehož vynechání dělá prázdný
   obrázek: kořenový `<g>` nese zoom/pan od d3 (`transform="translate(800,140)"`)
   a `getBBox()` vrací souřadnice **před** ní. Ořez je tedy
   `box.x * matrix.a + matrix.e` a obdobně pro `y`, plus padding.
4. **Nakreslit do canvasu** přes `data:image/svg+xml;charset=utf-8,` + `encodeURIComponent`
   a `new Image()`. **Canvas se tím nezašpiní** — změřeno, `toDataURL` prošlo — protože
   v SVG nejsou žádné externí odkazy (`<image href>` je prázdný seznam, `foreignObject`
   žádný).
5. **Pozadí vyplnit světlou barvou** předtím, než se obrázek nakreslí, a **nebrat ji
   z motivu**: v tmavém motivu vyjdou černé spojnice na tmavě šedém pozadí a je to sotva
   čitelné ([`assets/005-bracket-dark.png`](./assets/005-bracket-dark.png) vedle [`assets/005-bracket-light.png`](./assets/005-bracket-light.png)).
6. `canvas.toBlob(…, 'image/png')` → `File` → `exportFile`.

**Postup — skupinová tabulka:**

Analýza v ticketu 004 tvrdila, že na obrázek tabulky bude potřeba `dom-to-image`. **Tohle
zjištění to ruší:** jakmile existuje canvas pipeline, je levnější **tabulku nakreslit
z dat** (`fillText`, `strokeRect`) než screenshotovat DOM. Je to bez závislosti, není
tam problém s ořezem scrollem, výstup je deterministický, a hlavně — obrázek stejně nechce
zamrzlý řádek se scrollbarem, chce celou tabulku. Čísla se berou z `groupRowStats`, takže
se s obrazovkou nemůžou rozejít.

**Plán testů:**

- [ ] `svgToPngBlob` nad malým ručním SVG s `<path>` stylovaným přes CSS → v PNG je čára,
      ne plocha (kontrola po pixelech: střed obdélníku zůstane pozadím).
- [ ] `svgToPngBlob` respektuje transformaci kořenového `<g>` — obsah posunutý mimo
      viewport je v obrázku vidět (poměr neprázdných pixelů > 0).
- [ ] `svgToPngBlob` vrací `image/png` a nezašpiněný canvas.
- [ ] `groupPicture` nad tabulkou 3×3 → rozměry odpovídají počtu závodníků; obsahuje
      všech 6 statistických sloupců (kontrolováno přes odchycené `fillText` volání
      na fake kontextu, ne přes pixely).
- [ ] Obrazovka: tlačítko je vidět u skupiny i u pavouka, exportovaný soubor má typ
      `image/png` a jméno podle vzoru.
- [ ] Browser test: odehrát zápas, stáhnout obrázek, přečíst hlavičku PNG (bajty
      `89 50 4E 47`) a rozměry z IHDR; ověřit, že šířka odpovídá celému stromu,
      ne šířce okna.
- [ ] Browser test v tmavém motivu → pozadí obrázku je světlé.

**Rizika a zařízení:**

- **`navigator.share` s `image/png` je jiný případ než `text/csv`.** Změřit se to tady
  nedá — headless Chromium `canShare` na obrázek odpověděl `false`, ale ten stejně
  nesdílí nic, takže to nic neříká. **Patří to na telefon**, a je to přesně ta třída
  věcí, na které se tenhle projekt už spálil.
- **Velikost.** Na 4 lidech 1264×484 px a 27 kB při 2×. Šestnáctka bude řádově větší
  a pavouk roste hlavně do šířky; stojí za to změřit, než se to pustí, a případně
  omezit násobek rozlišení podle šířky stromu.
- **Písmo.** Vlepení `font-family` z `getComputedStyle` vrátí `"Open Sans", sans-serif`.
  Jestli je Open Sans načtené přes `@font-face`, **v serializované kopii k dispozici
  nebude** a spadne to na `sans-serif`. Na přiloženém obrázku to vypadá dobře, ale je to
  desktop; na telefonu to může vypadat jinak.

**Předpoklady:**

- Obrázek se dělá z toho, co je **vykreslené** (pavouk), takže tlačítko musí mít přístup
  k `<svg>`. Jdu cestou `querySelector('.tree-wrapper svg')` uvnitř handleru místo
  protahování refu skrz `TreeTournamentScreen` — je to jeden dotaz v obsluze kliknutí,
  ne stav, a ušetří to prop, který by jinak existoval jen kvůli exportu. Kdyby review
  chtělo ref, je to malá změna.
- Repasáž je druhé `<svg>` (`.repechage-wrapper`). Kreslím obě pod sebe do jednoho
  canvasu; když repasáž není, je obrázek jen hlavní strom.
- Jméno souboru: `kumite-<turnaj>-picture-<datum>-<hhmm>.png`, tedy stejný vzor jako
  `log` a `overview` z ticketu 004.

**Otevřené otázky:** obě jsou v `B` (třetí tlačítko vs. náhrada CSV, a rozlišení).
