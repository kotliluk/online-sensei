---
id: 013
slug: interval-reorder-touch
title: Přeuspořádání intervalů na dotyk
status: review
branch: interval-reorder-touch
---

# Přeuspořádání intervalů na dotyk

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Vyndáno z ticketu 009, protože je to nová
interakce, ne oprava layoutu. Uživatel:

„založ je taky, ať na ně pak odděleně kouknu a rozhodnu co s nimi"

**Nález:** v pokročilém nastavení intervalového časovače se pořadí intervalů mění
**výhradně** přes HTML5 drag-and-drop (`SetUpAdvancedInterval.tsx:81–91` a `:152–156`).
Prst na dotykovém displeji `dragstart` negeneruje, takže se na telefonu — tedy na hlavní
cílové platformě podle `CLAUDE.md` — nestane vůbec nic. Jiná cesta k přesunu neexistuje:
žádné šipky, žádné menu, žádný long press.

Navíc `cursor: grab` (`SetUpAdvancedInterval.scss:23`) je jediná afordance a na dotyku
není vidět, takže uživatel ani neví, že by to jít mělo.

Samotná logika přesunu (`SetUpScreenAdvanced.tsx:95–102`) je v pořádku — reviewer ji
protrasoval pro oba směry. Chybí jen způsob, jak ji na telefonu spustit.

**Proč to není součást ticketu 009:** ten je o layoutu a čitelnosti, tedy o CSS a textech.
Tohle je ~25 řádků nové interakce plus dva klíče do obou překladů, a je u toho rozhodnutí:

- **Dvě tlačítka ↑/↓** vedle křížku — nejlevnější, plně ovladatelné palcem, funguje i pro
  klávesnici. Zabere ale místo v řádku, který už kříž má.
- **Přesun na pointer eventech** jako `useLongPress` z ticketu 006 — zachová gesto
  „chytit a táhnout" i na dotyku, ale je to výrazně víc kódu a je to přesně ten typ
  interakce, u kterého ticket 006 ukázal, jak snadno se pohádá s prohlížečem (Android
  si long press vzal pro vlastní kontextové menu).

Za mě tlačítka: appka se ovládá v hale, často jednou rukou, a přetahování v seznamu je
i na dobře udělaném UI nepřesné. Ale je to volba, ne fakt — proto ticket, ne fix.

**Otevřená otázka:** má DnD na desktopu zůstat vedle tlačítek, nebo ho nahradit úplně?
Nechat obojí znamená dvě cesty ke stejné věci a dvojí údržbu.

## B — Zadání

**Dráha:** malá — jedna nová interakce v jedné komponentě, `C` se nepíše, gate je tady.

**Problém:** Pořadí intervalů v pokročilém nastavení jde změnit **jen** přetažením myší.
Prst `dragstart` negeneruje, takže na telefonu — na hlavní cílové platformě — pořadí změnit
nelze vůbec a jediná afordance (`cursor: grab`) není na dotyku vidět. Klávesnicí to nejde
také, řádek nemá ani `tabindex`, ani obsluhu kláves.

**Rozsah:**

- Každý interval dostane **tlačítka ↑ a ↓**. ↑ v prvním řádku a ↓ v posledním jsou
  `disabled` — stejný tvar, jaký už má křížek přes `disabledDelete`.
- **HTML5 drag-and-drop se odstraní úplně**, i na desktopu. Zdůvodnění níž.
- Dvě nová tlačítka + křížek dostanou v tom řádku **jednotnou velikost `$touch-target`
  (48 px)** a `touch-action: manipulation` — precedent z ticketu 009 (kolečka faulů).
  **Křížek dnes měří 2 rem (32 px)**; nechat ho menší vedle dvou osmačtyřicítek by byla
  vada, kterou bych sám vyrobil, takže roste s nimi. Je to viditelná změna nad rámec
  zadání — proto je tady, ne v diffu.
- **Uspořádání (rozhodnuto na gate):** šipky **pod sebou** ve svislém sloupci, křížek
  **napravo od nich**. Jedno uspořádání na všech šířkách — odpadá přepínání sloupec/řádek
  na `L-device`, které jsem původně navrhoval.
- Řádek tím roste o 48 px na šířku, a místa je málo: `10vw` boční padding plus `1rem`
  paddingu položky nechává na 360px displeji jen ~256 px, do kterých už dnes musí
  `set-up-name-input` o šířce 12 rem. Pole proto dostanou `css-min(12rem, 100%)`
  a smrštitelný kontejner (`min-width: 0`), zatímco tlačítka mají `flex-shrink: 0`.
  Je to tentýž vzor, jakým ticket 009 řešil přetékající chybovou hlášku.

**Mimo rozsah:**

- Přesun přes pointer eventy / long press (varianta B z nápadu). Ticket 006 ukázal, že si
  Android long press bere pro vlastní kontextové menu.
- Přetahování napříč sériemi, hromadný přesun, drag v modalu „Nahrát sérii".
- Velikost ostatních ovládacích prvků na té obrazovce — to je ticket 009.

**Akceptační kritéria:**

- [ ] Klik na ↑ u intervalu `i` prohodí `i` a `i-1`; klik na ↓ prohodí `i` a `i+1`.
- [ ] ↑ v prvním řádku je `disabled`, ↓ v posledním je `disabled`.
- [ ] U jediného intervalu jsou `disabled` obě šipky i křížek.
- [ ] Přesun **nepřepíše hodnoty** — název a délka jdou s intervalem, ne s pozicí.
- [ ] Po přesunu sedí zobrazená pořadová čísla `1)`, `2)`, … na nové pořadí.
- [ ] Obě šipky mají přístupné jméno rozlišující řádek (`Posunout 3. interval nahoru`),
      z nových klíčů v `cs.ts` i `en.ts`.
- [ ] Na řádku nezůstane nic z DnD: žádný `draggable`, žádný `cursor: grab`,
      žádné `advanced-interval-dnd-end`.
- [ ] Řádek se i s tlačítky vejde na 360px displej — pole se smrští, tlačítka ne.
- [ ] Sdílený odkaz i `localStorage` fungují dál — tvar dat se nemění, mění se jen pořadí
      prvků v poli, které se ukládalo i dosud.

**Proč DnD mizí, a ne zůstává vedle tlačítek**

Nápad tuhle otázku nechal otevřenou. Odpověď je *odstranit*, a to z důvodů, které jsou
v kódu vidět:

1. **Žebřík z `CLAUDE.md` začíná otázkou „nejde to odebráním?“ — tady jde.** Logika přesunu
   (`SetUpScreenAdvanced.tsx:92–99`) zůstává; mění se jen spouštěč. Pryč jde `DND_TYPE`,
   `handleDragStart`, `handleDragDrop`, oba `advanced-interval-dnd-end` divy, `draggable`
   na řádku, tři propy (`onDragStart`, `onDragEnd`, `isDragging`) a stav `isDragging`
   v rodiči.
2. **Dvě obezličky v tom souboru existují jen kvůli DnD.** Pole „Název“ a „Délka“ mají
   každé `draggable={true}` s `onDragStart` na `preventDefault` (`:112–116`, `:128–132`) —
   jejich jediná práce je zabránit tomu, aby tažení řádku sežralo označování textu
   v inputu. A `cursor: grab` sedí na `&, label` (`SetUpAdvancedInterval.scss:23–25`),
   takže se na desktopu ukazuje ručička i nad popisky formuláře. Obojí zmizí s DnD.
3. **Klávesnice.** Dnešní DnD je pro ni nedosažitelné. Tlačítka jsou dosažitelná zadarmo.
4. **Nic z DnD netestuje ani jeden test** — u obou komponent chybí adresář `tests/` úplně.
   Odstranění tedy nemá co rozbít a testy vzniknou tak jako tak.
5. Nápad sám cenu zachování pojmenoval: „dvě cesty ke stejné věci a dvojí údržba“.

**Co se tím platí, na rovinu:** na dlouhém seznamu bylo přesunutí osmého intervalu na první
místo jedno gesto, teď to je sedm ťuknutí — a počet intervalů není nijak omezený
(`VALIDATOR.advancedRoundIntervals` hlídá jen „aspoň jeden“). Reálná série na tréninku je
ale jednotky intervalů, takže mi to za tu jednu cestu ovládání stojí.

**Malá dráha — technické odrážky**

- **Kam:** `setUpAdvancedInterval/SetUpAdvancedInterval.tsx` + `.scss` (tlačítka, úklid DnD),
  `setUpScreenAdvanced/SetUpScreenAdvanced.tsx` (zjednodušení `handleIntervalMove`, zánik
  `isDragging`), `logic/translation/{translation,cs,en}.ts` (dva klíče), `atoms/button/Button.tsx`.
- **Co reusnu:** ikony `ArrowUp` / `ArrowDown` už v repu jsou (`icons/`, dnes je používá
  `OrderArrow` v `groupStopwatch/results`); `Button` + `button-color`; `$touch-target`
  a `touch-action: manipulation` z ticketu 009; `insertWords` pro parametrizované
  `aria-label` — přesně jak to dělá `Fouls.tsx:56`.
- **Jedna změna atomu:** `ButtonProps` dostane `'aria-label'?: string`. Je to jeden řádek,
  `{...other}` ho propustí beze změny těla. Alternativa (holý `<button>` jako ve `Fouls`)
  by obešla `button-color`.
- **Zjednodušení kontraktu:** `onMove` je dnes tvarovaný podle DnD („vlož před index `to`“,
  odtud ta korekce `from > to ? to : to - 1`). Bez DnD se z něj stane obyčejný přesun
  a v dítěti bude `onMove={(to) => handleIntervalMove(index, to)}` — stejně jako už jsou
  navázané `onChange` a `onDelete`.
- **Co otestuju:** oba směry přesunu (včetně toho, že jde interval a ne hodnota), obě
  krajní `disabled`, jediný interval, přečíslování `1)`…`n)`, a že v DOM nezůstal
  `draggable`. Testy jdou do nových `setUpScreenAdvanced/tests/`.
- **Čím to může selhat na zařízení:** jen layout. Tři tlačítka po 48 px se na 360px displeji
  do řádku vedle pole širokého 12 rem nevejdou — proto svislý sloupec do `L-device`.
  To emulovaný viewport neuhlídá spolehlivě, patří to pod prst.

**Předpoklady:**

- Šipky posouvají **o jednu pozici**. Žádné „na začátek/konec“, žádné opakování při držení.
- Nová interakce se nepromítá do sdíleného odkazu ani do `localStorage` — pořadí se
  ukládalo v poli i dosud, tvar dat se nemění, takže **staré uložené série i staré odkazy
  fungují beze změny**.


## D — Hotovo

**Co se udělalo:** Každý interval má šipky ↑/↓ ve svislém sloupci a napravo od nich křížek,
všechny tři o velikosti `$touch-target`. HTML5 drag-and-drop je pryč celý, včetně obou
obezliček, které kvůli němu existovaly (`draggable` + `preventDefault` na polích) a
`cursor: grab`. Kontrakt `onMove` se zmenšil z „vlož před tuhle mezeru“ na obyčejný přesun.
Commity: `2f0a051` (zadání a rozhodnutí o DnD), `cc286df` (implementace a testy),
`4b2d332` (oprava rozestupu + README).

**Naplnění akceptačních kritérií:**

| Kritérium | Čím | Stav |
| --------- | ---- | ---- |
| ↑ prohodí `i` a `i-1`, ↓ prohodí `i` a `i+1` | `SetUpAdvancedInterval.tsx:116,125` + `SetUpScreenAdvanced.tsx:94` · testy *moves an interval up / down* | ✅ |
| ↑ v prvním řádku a ↓ v posledním jsou `disabled` | `:117`, `:126`, `SetUpScreenAdvanced.tsx:181` · test *offers no way up out of the first row…* | ✅ |
| U jediného intervalu `disabled` obě šipky i křížek | test *has nothing to press on a single interval* | ✅ |
| Přesun nepřepíše hodnoty | testy čtou **název i délku** každého řádku, takže přesun, který by prohodil řádky a nechal hodnoty na místě, neprojde | ✅ |
| Přečíslování `1)`…`n)` sedí | test *renumbers the rows after a move* | ✅ |
| Přístupné jméno rozlišuje řádek, z `cs.ts` i `en.ts` | `:63,115,124,134`, klíče `moveUp`/`moveDown`/`delete` · testy hledají tlačítka jménem | ✅ |
| Na řádku nezůstane nic z DnD | test *nothing on the row is draggable any more* | ✅ |
| Řádek se vejde na 360px displej | `min-width: 0` + `css-min(12rem, 100%)` + `flex-shrink: 0` | ⚠️ **neověřeno** — jsdom nedělá layout, viz níž |
| Sdílený odkaz i `localStorage` fungují dál | tvar dat se nemění, mění se jen pořadí prvků v poli; `urlState.test.ts` (38 testů) prochází beze změny | ✅ |

**Odchylky od B:**

- **Tři překladové klíče, ne dva.** Přibyl `delete` pro křížek. Kritérium mluví o tom, že
  je křížek u jediného intervalu vypnutý, a to se nedá otestovat přes roli a jméno
  tlačítka, které žádné jméno nemá. Ikonové tlačítko bez přístupného jména byl tak jako
  tak nedostatek — jen se do zadání nedostal.
- **Layout bez breakpointu.** Původní návrh přepínal sloupec/řádek na `L-device`;
  rozhodnutí na gate (šipky pod sebou, křížek napravo) to zjednodušilo na jedno uspořádání.
- **Ikony berou `fill='currentColor'`** a `Cross` kvůli tomu dostal `IconPropsWithFill`
  místo `IconProps`. Nebylo to v plánu, důvod je v Gotchas.

**Gotchas:**

- **`button-color` nechává vypnutému tlačítku černý popisek.** Na tmavém tématu je to
  černá ikona na `$grey-dark`. U křížku to byl okrajový stav (jediný interval), u šipek je
  to **stav normální** — první řádek nikdy nejde nahoru, poslední nikdy dolů, takže
  vypnuté šipky jsou na obrazovce vždycky. Proto `fill='currentColor'` a barva vypnutého
  stavu z tématu. Kdo příště přidá ikonové tlačítko, narazí na totéž.
- **Rozestup mezi řádky dělaly drop zóny.** `.advanced-interval-li` měl schválně vynulovaný
  svislý padding, protože ty dva 1rem divy nad a pod řádkem mezeru dodávaly samy. Smazat je
  a padding nevrátit znamená řádky nalepené na sebe — a **žádný test v tomhle repu to
  neuvidí**, protože jsdom nepočítá layout. Našel to až vlastní review diffu.
- **`handleIntervalMove` nemá kontrolu mezí, a je to záměr.** Konce seznamu zavírá `disabled`
  na tlačítkách, ne podmínka v handleru; prohlížeč na vypnutém `<button>` klik nepustí.
  Test *does nothing when a disabled arrow is pressed anyway* tu hranici drží. Původní
  podmínka `from !== to && from !== to - 1` existovala jen proto, že drop padá **mezi**
  řádky — se šipkami nemá co odmítat.
- Pořadí operací v přesunu: `intervals[from]` se čte z **původního** pole, ne z toho, ze
  kterého se právě vyřízlo. Mutace, která to zamění za `newIntervals[from]`, umře.

**Ověřeno na:** **jen automatické testy — na zařízení zatím neověřeno.**

Automaticky: 540 testů (z 531), z toho 9 nových; `yarn typecheck` čistý, `yarn build`
prochází, `yarn lint` 0 chyb / 54 warningů (bylo 59 — ubyly s DnD callbacky, žádný
nepřibyl). **Mutační test: 15 mutací napříč `SetUpAdvancedInterval.tsx` a
`SetUpScreenAdvanced.tsx`, 15 z 15 zabito.**

Co chce vidět telefon (`yarn dev:https`, pokročilé nastavení intervalového časovače):

1. **Vejde se řádek na 360px displej?** Tohle je celý důvod, proč tu tahle sekce je —
   jsdom nedělá layout a repo nemá headless prohlížeč, takže na to žádný test neodpoví.
2. **Vypnuté šipky na tmavém tématu** — je vidět, že tam jsou, a zároveň že jsou vypnuté?
3. **Nezúžilo se pole „Název“ tak, že se do něj nedá psát?** Dostalo `css-min(12rem, 100%)`,
   takže se na úzkém displeji smrští.
4. **Rozestup mezi řádky** po zrušení drop zón.
5. Přesun palcem jednou rukou — sedí šipky tam, kam palec dosáhne?

## Review

Branch: `interval-reorder-touch` · revieweři: **žádní**

**Proč žádní:** tahle session má stálou instrukci nepouštět subagenty, pokud si o ně
neřekneš. Fáze 5 je normálně staví paralelně (`correctness`, `tests`, `device-ux`), a to
se nestalo — neschovávám to za „bez nálezů“. Místo nich proběhlo vlastní čtení diffu
a **mutační test**, což je v tomhle repu nejtvrdší náhrada za `tests-reviewer`: 15 mutací,
15 zabito. Co tím ale nahradit nejde, je nezávislost — nálezy níž našel tentýž člověk,
který ten kód napsal. Jestli chceš plnou pátou fázi, řekni a pustím ji.

**Opravit (90–100)**

- [major] `SetUpScreenAdvanced.scss:9` · `.advanced-interval-li` měl vynulovaný svislý
  padding, protože rozestup mezi řádky dodávaly ty dvě 1rem drop zóny. S jejich smazáním
  by řádky slehly na sebe, oddělené jen linkou. → padding se vrátil na hodnotu z
  `.set-up-item`, což dá stejné 2 rem mezi sousedy jako dřív · **✅ opraveno** (`4b2d332`)
- [major] `SetUpAdvancedInterval.tsx:115,124,134` · ikonová tlačítka bez přístupného jména;
  u šipek by navíc šest tlačítek „Move up“ nešlo od sebe odlišit → `aria-label` s číslem
  řádku, vzor z `Fouls.tsx:56` · **✅ opraveno** (součást implementace)
- [minor] `SetUpAdvancedInterval.scss` · vypnutá šipka měla černou ikonu na `$grey-dark`
  (tmavé téma), a vypnutá šipka je v každém seznamu vždycky aspoň jedna → `currentColor`
  + barva z tématu · **✅ opraveno**

**Zvážit (80–89)**

- `SetUpAdvancedInterval.scss` · vypnutý stav teď kreslí ikonu v **plném** kontrastu
  (bílá na tmavém tématu). Čitelné to je, ale může to číst spíš jako zapnuté než jako
  vypnuté; jediný signál „vypnuto“ zůstává šedé pozadí z `button-color`. Nechal jsem to
  být — snížit kontrast zpátky by vrátilo přesně tu vadu, kvůli které se to měnilo.
  **Chce to oko na telefonu, ne další podmínku.**
- `SetUpAdvancedInterval.scss` · `css-min(12rem, 100%)` na poli „Název“ znamená, že se na
  úzkém displeji smrští na nezjištěnou šířku. Je to lepší než přetékat mimo obrazovku, ale
  kolik z něj zbyde, ví jen zařízení.
- `SetUpScreenAdvanced.tsx:94` · `handleIntervalMove` nekontroluje meze. Je to vědomé
  (konce zavírá `disabled` a drží to test), ale kdo někdy `disabled` odebere, dostane tiché
  přeházení místo výjimky.

**Bez nálezů:** — (viz výš, žádný reviewer neběžel)
