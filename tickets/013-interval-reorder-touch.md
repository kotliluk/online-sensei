---
id: 013
slug: interval-reorder-touch
title: Přeuspořádání intervalů na dotyk
status: approved
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

## Review

<!-- doplní /ticket-review -->
