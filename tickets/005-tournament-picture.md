---
id: 005
slug: tournament-picture
title: Přehled turnaje jako obrázek
status: done
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
- [ ] **Turnaj o 64 lidech vrátí obrázek, ne prázdnou plochu** — násobek rozlišení se
      podle velikosti stromu sám sníží.
- [ ] Turnaj, ve kterém se ještě nic neodehrálo, se stáhnout dá a nespadne.
- [ ] Soubor je `image/png` a jmenuje se ve stejném duchu jako ostatní exporty.
- [ ] Texty v `cs.ts` i `en.ts`.
- [ ] Na telefonu ověří uživatel — sdílení obrázku je jiný MIME než CSV.

**Rozhodnuto (2026-08-17):**

1. **Třetí tlačítko**, CSV přehled zůstává. U pavouka je obrázek skoro jistě lepší než
   CSV seznam kol, ale u skupiny je tabulka pořád to, v čem jde řadit a sčítat — a to
   obrázek nikdy neumí. Na 375 px se řada zalomí na dva řádky; `flex-wrap` tam už je,
   takže nic nepřeteče.
2. **Rozlišení 2×**, ale **shora omezené plochou canvasu**, ne napevno. Doměřeno až
   na 64 lidí: datová velikost není důvod šetřit (1,5 MB v nejhorším), zato pixelová
   plocha ano, protože její překročení vrací prázdný obrázek bez chyby. Detaily
   a tabulka měření jsou v `C` → „Rizika a zařízení".

## C — Analýza

**Analýza je postavená na měření, ne na odhadu.** Tvrzení ze sekce A („pavouk je čisté SVG,
takže obrázek z něj jde bez závislosti") **v naivní podobě neplatí** — první pokus vyrobil
prázdný soubor a druhý černé kaňky místo spojnic. Recept níž je ověřený v prohlížeči
a produkuje [tenhle obrázek](./assets/005-bracket-light.png).

**Reuse / gap:**

| Dílčí věc                            | Stav        | Kde to žije / co reusnu                                                                                         |
| ------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------- |
| Doručení souboru (sdílet / stáhnout) | ✅ existuje | `logic/download/exportFile.ts:69`; `willShareFile` bere MIME jako parametr, takže `image/png` projde beze změny |
| Popisek podle zařízení               | ✅ existuje | `TournamentScreen.tsx:38` (`shares`) — třetí tlačítko se přidá do stejné podmínky                               |
| Razítko a slug do jména souboru      | ✅ existuje | `logic/download/fileName.ts` z ticketu 004                                                                      |
| Řádek tlačítek                       | ✅ existuje | `.tournament-export` v `TournamentScreen.scss:12`, `flex-wrap` už tam je                                        |
| Data skupinové tabulky               | ✅ existuje | `selectKumiteTimerTournamentGroup` + `groupRowStats` z ticketu 004                                              |
| Vykreslený pavouk                    | ✅ existuje | `<svg>` uvnitř `.tree-wrapper` (`TreeTournamentScreen.tsx:61`)                                                  |
| SVG → PNG                            | ❌ chybí    | nové, `logic/download/`                                                                                         |
| Kreslení tabulky do canvasu          | ❌ chybí    | nové                                                                                                            |

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
   takže **z čar jsou vyplněné plochy**. Změřeno; ukazuje to
   [`assets/005-links-as-blobs.png`](./assets/005-links-as-blobs.png). Stačí projít `[svg, ...svg.querySelectorAll('*')]` a naklonovaným prvkům
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
- [ ] Násobek rozlišení: malý strom dostane 2×, strom nad rozpočet dostane méně —
      testováno na čisté funkci, ne přes vykreslování.
- [ ] Browser test na 64 lidech → obrázek má neprázdné pixely a plocha je pod rozpočtem.

**Rizika a zařízení:**

- **`navigator.share` s `image/png` je jiný případ než `text/csv`.** Změřit se to tady
  nedá — headless Chromium `canShare` na obrázek odpověděl `false`, ale ten stejně
  nesdílí nic, takže to nic neříká. **Patří to na telefon**, a je to přesně ta třída
  věcí, na které se tenhle projekt už spálil.
- **Velikost — a je to jiná velikost, než se čekalo.** Změřeno až do 64 lidí, což je
  strop aplikace, při 2×:

  | lidí | canvas     | Mpx      | PNG    | JPG q90 |
  | ---- | ---------- | -------- | ------ | ------- |
  | 4    | 1264×484   | 0,6      | 32 kB  | 34 kB   |
  | 8    | 2064×1324  | 2,7      | 97 kB  | 84 kB   |
  | 16   | 2864×3004  | 8,6      | 255 kB | 195 kB  |
  | 32   | 3664×6364  | 23,3     | 632 kB | 443 kB  |
  | 64   | 4464×13084 | **58,4** | 1,5 MB | 979 kB  |

  **Datová velikost problém není.** I plný turnaj o 64 lidech je 1,5 MB, což je běžná
  fotka. **Problém je pixelová plocha:** prohlížeče mají strop na velikost canvasu
  a **jeho překročení nevyhodí chybu — vrátí prázdný obrázek.** Na desktopovém Chrome
  je limit hodně vysoko (proto tabulka výš vůbec vznikla), ale **iOS Safari má
  dokumentovaný strop kolem 16,7 Mpx**, což při 2× překročí už turnaj o 32 lidech.
  Zároveň je i pavouk sám o sobě dost nepoužitelný obrázek — poměr stran u 64 lidí
  je 1:3 a je to dlouhý úzký pruh; výška roste lineárně s počtem lidí, šířka jen
  s počtem kol.

  **Řešení: strop na plochu, ne na násobek.** Násobek se spočítá jako
  `min(2, sqrt(ROZPOČET / (šířka * výška)))`, takže malý turnaj dostane plné 2×
  a velký se sám zmenší místo toho, aby tiše vrátil bílý obdélník. Rozpočet
  konzervativně pod ten iOS limit.

- **JPG tady nepomůže**, i když by to znělo logicky. Ušetří 20–35 %, a to až od osmi
  lidí — **u čtyř je dokonce větší než PNG** (34,4 vs 32,4 kB), protože je to plochá
  grafika s ostrými hranami, přesně to, na co je PNG stavěné a JPG ne. Ztrátová
  komprese by navíc dělala artefakty kolem drobných jmen, tedy kolem toho jediného,
  co se v obrázku musí přečíst. A hlavně: **neřeší to skutečné omezení** — na prázdný
  canvas se narazí dřív, než se vůbec začne kódovat.
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

## D — Hotovo

**Co se udělalo:** Třetí tlačítko na turnajové obrazovce, které stáhne turnaj jako PNG —
pavouk serializací vykresleného SVG, skupinová tabulka
nakreslením z dat. Sada je 208 unit
testů (ze 188) a 86 browser testů (z 81). **Žádná nová závislost.**

**Odchylky od C:** dvě.

- **`dom-to-image` nebylo potřeba ani u skupiny.** Analýza s tím počítala jako s možností;
  ve výsledku se tabulka kreslí z řádků, které staví CSV přehled, takže se obrázek a soubor
  nemůžou rozejít. `groupOverviewRows` je kvůli tomu vytažené z `csv.ts` ven.
- **`tournamentCsvFileName` se rozpadlo na sdílené `tournamentFileName`**, aby obrázek
  dostal jméno stejným pravidlem jako obě CSV, jen s jinou příponou.

**Gotchas:**

- **jsdom nemá 2D kontext ani `getBBox`.** `getContext('2d')` vrací `null` s hláškou
  „without installing the canvas npm package". Kód je proto dělený podle toho, co jde
  otestovat: `pictureScale` a `cropBox` berou čísla a vrací čísla, `tableLayout` bere
  měřicí funkci jako argument. Obrázek samotný ověřuje jen prohlížeč.
- **Změna velikosti canvasu resetuje celý jeho kontext.** `scale`, `font` a `translate`
  musí přijít až po nastavení `width`/`height`, jinak se tiše zahodí.
- **Blob URL může canvas zašpinit**, a zašpiněný canvas nejde přečíst zpátky. Proto
  `data:` URL, i když je delší.
- **Volný práh v testu je horší než žádný.** První verze testu „spojnice jsou čáry"
  měřila podíl neprázdných pixelů v rozmezí 0,02–0,3 — a mutace, která vypnula vlepování
  stylů, tím rozmezím prošla (0,1225 → 0,1791). Rozliší to až podíl **černé**:
  1,7 % u čar proti 7,1 % u kaněk. Práh je teď z toho měření, ne z odhadu.

**Ověřeno na:** desktop Chrome (Playwright, 86/86), oba motivy, skupina i pavouk,
diakritika. Doměřeno až na 64 lidí — obrázek se sám zmenší pod rozpočet místo aby vrátil
prázdnou plochu.

**Testy ověřené mutacemi: 11 mutací, všech 11 zčervenalo.** Čtyři z nich šly proti kódu,
který umí prověřit jen prohlížeč, takže běžely proti druhému dev serveru nad zmutovanou
kopií.

**Na telefonu ověřeno 2026-08-17** (uživatel, přes `yarn dev:https`): **sdílení obrázku
funguje.** Tím padá poslední otevřená otázka ticketu — `image/png` prochází
`navigator.share` stejně jako `text/csv`, což se odsud změřit nedalo a headless prohlížeč
na to odpovídal `false` jen proto, že sám nesdílí nic.

Ze stejné zkoušky vzešly dvě opravy, obě popsané níž: zoom v obrázku a chybějící nadpis
nad repasáží.

### 2026-08-17 — nález z ručního testu

Uživatel při zkoušení narazil na to, že **obrázek nesl aktuální přiblížení** a že se
hlavní pavouk a repasáž stáhly v různých velikostech.

Změřeno a potvrzeno: po odzoomování vyšel obrázek 291×144 místo 1264×484. Příčina byla
v tom, že se ořez počítal **skrz** transformaci, kterou d3 drží pan a zoom — a protože
strom a repasáž jsou dvě samostatná `<svg>` s vlastním stavem zoomu, vyšla každá půlka
jinak velká.

**Oprava je zároveň zjednodušení:** transformace se nemá kompenzovat, má se z kopie
zahodit. `getBBox()` odpovídá v souřadnicích _před_ ní, což je přesně ta přirozená
velikost, o kterou jde. Tím z kódu zmizel celý `cropBox` i s maticí a zbylo `padBox`.
Obrázek je teď stejný bez ohledu na to, jakým gestem obrazovku někdo opustil —
strom s repasáží má v obou půlkách stejně velké uzly.

Regresní test: „the picture is the same whatever the bracket has been zoomed to".
Ověřený mutací zpět na původní tvar — padá právě on. Sada je 206 unit a 87 browser testů.

**Poučení do příště:** analýza tohle nezachytila, protože všechna měření při psaní `C`
proběhla na čerstvě otevřené obrazovce, kde je zoom vždycky `scale(1)`. Měřit stav,
do kterého se uživatel dostane až gestem, chce ten stav napřed vyrobit.

### 2026-08-17 — nadpis nad repasáží

Z ruční zkoušky: obrázek neměl nadpis „Repasáž", který obrazovka nad tou částí má
(`TreeTournamentScreen.tsx:74`, `<h2>`). Obrázek má být tím, co obrazovka ukazuje, takže
tam patří.

`svgsToPngBlob` teď nebere `SVGSVGElement[]`, ale `PictureBlock[]` — kreslený obsah plus
volitelně, jak se ta část jmenuje. Skládání dostalo čistou funkci `stackBlocks`, takže
aritmetika (kolik místa nadpis ubere a kde který blok začne) jde otestovat bez plátna.
Hlavní strom nadpis nedostává, protože ho nemá ani na obrazovce.

Testy: čtyři unit testy na `stackBlocks` a browser test, který porovná obrázek s nadpisem
a bez něj — musí být vyšší, stejně široký, a v tom přibylém pruhu musí něco být. Ověřeno
třemi mutacemi (nekreslit text, nakreslit ho přes pavouka, nerezervovat místo), všechny tři
padly právě na něm. Sada je 210 unit a 88 browser testů.

**Prázdné místo kolem repasáže — vědomě ponecháno.** Její `getBBox()` je 500×280, ale
samotný zápas zabírá 200×70; nafukuje ji neviditelný `rect` s třídou `repechage-root`
(`TreeNode.tsx:35`, 400×280 na `y: -140`), který slouží jako rozvržení a cíl kliknutí, ale
do bboxu se počítá.

Rozhodnutí uživatele: **repasáž má vždy méně kol než hlavní pavouk, takže její rozšíření
je v pohodě.** U šířky to platí bez výhrad — obrázek je široký jako nejširší blok, takže
těch +400 jednotek nestojí nic, dokud je repasáž užší než strom (u osmi lidí 500 proti
1000). U **výšky** to neplatí stejně, protože bloky se skládají pod sebe a výška se sčítá:
v ukázkovém obrázku je z 2044 px zhruba 420 px prázdna pod nadpisem. Měřeno na repasáži
o jednom zápase, což je nejhorší případ — u delší repasážní větve si obsah tu výšku vezme
sám. Delší větev změřená nebyla.
