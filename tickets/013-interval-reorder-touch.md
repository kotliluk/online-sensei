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
obezliček, které kvůli němu existovaly, a `cursor: grab`. Kontrakt `onMove` se zmenšil
z „vlož před tuhle mezeru“ na obyčejný přesun. Po review a po tvých poznámkách z telefonu
k tomu přibylo: **fokus jde s přesunutým intervalem**, **přesunutý řádek se na 1,2 s podbarví**,
**pole typu je červené pro zátěž a zelené pro pauzu**, a **tři pole na telefonu jsou zarovnaná
doleva** místo na střed.

**Naplnění akceptačních kritérií:**

| Kritérium | Čím | Stav |
| --------- | ---- | ---- |
| ↑ prohodí `i` a `i-1`, ↓ prohodí `i` a `i+1` | `SetUpAdvancedInterval.tsx:116,125` + `SetUpScreenAdvanced.tsx:94` · testy *moves an interval up / down* | ✅ |
| ↑ v prvním řádku a ↓ v posledním jsou `disabled` | `:117`, `:126`, `SetUpScreenAdvanced.tsx:181` · test *offers no way up out of the first row…* | ✅ |
| U jediného intervalu `disabled` obě šipky i křížek | test *has nothing to press on a single interval* | ✅ |
| Přesun nepřepíše hodnoty | `rowValues()` čte **všechny tři** hodnoty řádku včetně typu; test *carries the type with the interval and not with the row* má fixture s `pause` | ✅ |
| Přečíslování `1)`…`n)` sedí | test *renumbers what the rows show, not only what their buttons say* — čte viditelný `<span>`, ne `aria-label` | ✅ |
| Přístupné jméno rozlišuje řádek, z `cs.ts` i `en.ts` | `:63,115,124,134` · test *names the arrows in Czech as well, row number and all* | ✅ |
| Na řádku nezůstane nic z DnD | test *nothing of the drag is left on the row* — `draggable`, `advanced-interval-dnd-end` i kladná kotva na počet řádků | ✅ |
| Řádek se i s tlačítky vejde na 360px displej | ověřeno tebou na telefonu; navíc změřeno reviewerem v Blinku na šířkách 320–1920 bez přetečení | ✅ |
| Sdílený odkaz i `localStorage` fungují dál | tvar dat se nemění; `urlState.test.ts` (38 testů) prochází beze změny | ✅ |

**Odchylky od B:**

- **Tři překladové klíče, ne dva.** Přibyl `delete` pro křížek — kritérium mluví o tom, že je
  u jediného intervalu vypnutý, a bez přístupného jména se na něj nedá dotázat. Ikonové
  tlačítko bez jména byl tak jako tak nedostatek.
- **Layout bez breakpointu**, podle rozhodnutí na gate (šipky pod sebou, křížek napravo).
- **Ikony berou `fill='currentColor'`**, `Cross` kvůli tomu dostal `IconPropsWithFill`.
- **Čtyři věci nad rámec zadání**, tři z nich na tvoji žádost po ručním testu: barvení pole
  typu, zarovnání doleva, podbarvení přesunutého řádku. Čtvrtá je fokus jdoucí s intervalem —
  ten si vyžádalo review, viz níž.

**Gotchas:**

- **Řádek klíčovaný indexem znamená, že se DOM nepřesouvá.** React jen vymění propy, takže
  stisknuté tlačítko zůstane stát a patří pak jinému intervalu — druhý stisk první přesun
  vrátí. Řeší to fokus posunutý na řádek, kam interval dopadl, plus podbarvení pro oko.
  **Strukturální řešení by bylo stabilní `key` z identity intervalu**, ale ta by musela vzniknout
  v `types/interval`, a tím i v URL kódování a v `localStorage` — na tenhle ticket moc.
- **`button-color` nechává vypnutému tlačítku černý popisek.** U šipek je vypnutý stav
  normální, ne okrajový. A pozor na druhou stranu téže mince: `t($primary-text)` dá vypnuté
  ikoně **vyšší** kontrast než zapnuté (11,6 : 1 proti 7,8 : 1), takže to čte jako zvýrazněné.
  Správně je `t($secondary-text)`.
- **Rozestup mezi řádky dělaly drop zóny.** `.advanced-interval-li` měl schválně vynulovaný
  svislý padding. Smazat zóny a padding nevrátit = řádky nalepené na sebe, a **žádný test
  v tomhle repu to neuvidí**.
- **`handleIntervalMove` má kontrolu mezí, a ta je přes UI nedosažitelná.** Konce zavírá
  `disabled` (a to testy hlídají). Pojistka je tam proto, že selhání není no-op: `splice(-1, 0, x)`
  počítá od konce a tiše vloží před poslední prvek. Je to jediná mutace, která v sadě
  **přežije** — vědomě, protože ji nejde zvenčí vyvolat.
- `intervals[from]` se čte z **původního** pole, ne z toho, ze kterého se právě vyřízlo.

**Ověřeno na:**

**Android (Motorola), ručně** — pět bodů z prvního kola prošlo: řádek se na displej vejde,
pole „Název“ zůstalo použitelné, vypnuté šipky jsou na tmavém tématu vidět, rozestup mezi
řádky sedí, přesun palcem funguje. Z toho testu vzešly tři úpravy výš.

Automaticky: **549 testů** (z 531), z toho **18 nových**; `yarn typecheck` čistý, `yarn build`
prochází, `yarn lint` 0 chyb / 54 warningů (bylo 59; ubylo jich s DnD callbacky, žádný
nepřibyl). **Mutační test: 25 mutací, 24 zabito** — jediný přeživší je popsaný v Gotchas.

Změřeno reviewerem v headless Chrome na šířkách 320/360/375/390/412/768/1024/1280/1440/1920.

**Co zůstává neověřené — chce iPhone, ne Android:**

1. **Barvení `<select>` pozadím.** iOS Safari si select s nativním vzhledem historicky
   překresluje. Kdyby pozadí neprošlo, zůstane černý text — na tmavém tématu vada.
2. **`css-min(12rem, 100%)` v shrink-to-fit rodiči.** WebKit počítá neurčité procento uvnitř
   `min()` jinak než Blink. Hledá se pole „Název“ splasklé na šířku popisku, nebo naopak
   trčící přes tlačítka (kreslilo by se **nad** nimi a sebralo by jim tapy).
3. Stačí 1,2 s podbarvení, než se ťukne podruhé?

## Review

Branch: `interval-reorder-touch` · revieweři: **correctness · tests · react-state · device-ux** (všichni čtyři)

Proč všichni: diff sahá na logiku přesunu, na první testy, které ty dvě komponenty kdy
měly, na vlastnictví stavu mezi rodičem a řádkem, a hlavně na dotyk, dvě témata, dvě
jazykové mutace a layout na úzké obrazovce. Každá ze čtyř optik měla co říct a žádná
neposlala „bez nálezů“.

**Opravit (90–100)**

- [major] `SetUpScreenAdvanced.tsx:172` · **fokus ani pozice nejdou s přesunutým intervalem.**
  Řádky jsou klíčované indexem, takže React DOM uzly nepřesouvá — jen jim vymění propy.
  Stisknuté tlačítko zůstane stát a patří teď intervalu, který zabral staré místo, takže
  druhý stisk první přesun **vrátí**. Interval tedy nešlo protáhnout seznamem, aniž by se
  tlačítko mezitím pustilo — a klávesnice byla jeden ze tří důvodů, proč se DnD ruší.
  Našly to **nezávisle na sobě dvě optiky** (correctness 90, react-state 95) a **potvrdil
  to i uživatel na telefonu**, ještě než nálezy dorazily. → fokus jde na tutéž šipku na
  řádku, kam interval dopadl, a na druhou šipku, když ta použitá právě na konci seznamu
  zhasla · **✅ opraveno**
- [major] `SetUpAdvancedInterval.tsx:67` · **viditelná pořadová čísla nehlídal žádný test.**
  Mutace `{index})` místo `{position})` — tedy `0)`, `1)`, `2)` na obrazovce — prošla
  všemi devíti testy. Kritérium přitom bylo v sekci D odškrtnuté ✅ právě tím testem, který
  ale četl `aria-label`, ne ten `<span>`. Přesně ta falešná jistota, kvůli které se testy
  reviewují · **✅ opraveno** (nový `rowNumbers()` čte, co je vidět)
- [major] `SetUpAdvancedInterval.tsx:119,128` · **směr ikony nehlídalo nic.** Prohodit
  `<ArrowUp>` a `<ArrowDown>` uvnitř tlačítek a nechat `aria-label`, `onClick` i `disabled`
  beze změny → všechno zelené. Přitom prst se řídí ikonou a `aria-label` pro něj neexistuje.
  První oprava přes název třídy **taky přežila** (třídu si špatná ikona nese stejně ochotně),
  takže test teď porovnává, co se doopravdy vykreslí, proti tomu, co kreslí sama ikona ·
  **✅ opraveno** (dvakrát)
- [major] `tests/SetUpScreenAdvanced.test.tsx` · **test „does nothing when a disabled arrow
  is pressed anyway“ nemohl zčervenat.** Stál na dvou intervalech, a to je jediná délka, kde
  je nechráněný `splice` shodou okolností no-op na obou koncích. Ticket ho v Gotchas uváděl
  jako důkaz, že handler pojistku nepotřebuje — neplatilo to · **✅ opraveno** (tři intervaly)
- [minor] `SetUpScreenAdvanced.tsx:94` · **`handleIntervalMove` bez kontroly mezí neselže
  jako no-op.** Pro `to === -1` počítá `splice(-1, 0, x)` od konce a **tiše** vloží interval
  před poslední. Nahlásily dvě optiky (react-state 90, correctness protrasoval, že hrana je
  dnes nedosažitelná) · **✅ opraveno**
- [minor] `tests/…` · křížek se zkoušel jen na jednořádkovém seznamu, takže `disabledDelete={true}`
  i konstantní `1` v jeho jménu přežily · **✅ opraveno**
- [minor] `tests/…` · české klíče neprocházely žádným testem — `moveUp` bez `__{1}__` prošlo
  typecheckem i testy a česká verze by měla šest tlačítek se stejným jménem · **✅ opraveno**
- [minor] `SetUpAdvancedInterval.scss:81` · **`<select>` je jediné pole, které neustoupí.**
  Změřeno v Blinku na deseti šířkách: min-content 84 px, na 320px displeji leží **6,7 px
  selectu pod tlačítkem ↑**, které ho překreslí a uřízne mu rozbalovací šipku; na 360 px
  zbývá rezerva 25 px. Komentář v CSS tvrdil „pole ustoupí“, ale ustupovala jen dvě ze tří ·
  **✅ opraveno** (`css-min(6rem, 100%)` i pro select)
- [minor] `tests/…` · `rowValues()` četl dvě hodnoty ze tří a všechny fixtures byly `work`,
  takže mutace „přesouvaný interval se převede na work“ přežila · **✅ opraveno**
- [minor] `tests/…` · z DnD se ověřoval jen `draggable`, ne `advanced-interval-dnd-end`,
  a assert byl čistě negativní — prošel by i na prázdné obrazovce · **✅ opraveno**

**Opraveno nad rámec nálezů, protože to změřil device-ux**

- [minor] `SetUpAdvancedInterval.scss:139` · **vypnutá šipka měla vyšší kontrast než zapnutá.**
  Moje první oprava (`t($primary-text)`) dala na tmavém tématu 11,6 : 1 proti 7,8 : 1 u šipky,
  která funguje — „vypnuto“ tedy neslo jen pozadí a ikona četla spíš jako zvýrazněná. Byla to
  moje vlastní položka v „Zvážit“ a reviewer k ní dodal čísla i token · **✅ opraveno**
  (`t($secondary-text)`, 4,75 : 1 symetricky v obou tématech)

**Zvážit (80–89) — nechal jsem na tebe**

- `SetUpAdvancedInterval.scss:82,86` · `css-min(12rem, 100%)` je v repu **poprvé v kontextu,
  kde je i rodič shrink-to-fit** (dosavadní precedent `css-min(16rem, 90vw)` má definitivní
  jednotku). Blink změřen na 320–1920 bez přetečení; **WebKit počítá neurčité procento uvnitř
  `min()` jinak** a Safari nebylo na čem spustit. Patří to pod prst na iPhonu, ne do dalšího
  CSS naslepo.
- `SetUpAdvancedInterval.scss:67` · barvení `<select>` pozadím **nemusí na iOS Safari projít** —
  select s nativním `-webkit-appearance` si pozadí historicky převrství. Kdyby neprošlo,
  zůstane `color: $black`, a to je černý text na tmavém tématu, tedy přesně ta vada, kterou
  tenhle ticket u tlačítek odstraňoval. Neopravuju to naslepo: `appearance: none` bere selectu
  nativní šipku, což je viditelná ztráta, a **je to produktové rozhodnutí, ne oprava**. Fallback,
  když se to na iPhonu ukáže: nést barvu jen rámečkem.
- `SetUpScreenAdvanced.tsx:181` vs `SetUpAdvancedInterval.tsx:117` · `isLast` počítá rodič,
  `index === 0` dítě — jeden pojem, dva vlastníci. Chybu to dnes nedělá; hnít bude, až někdo
  přidá `isFirst` nebo „na začátek“. Menší varianta je poslat dítěti `count` a odvodit obě
  hranice u něj. Je to úklidové rozhodnutí, ne vada, tak ho nechávám na tebe.
- `SetUpAdvancedInterval.scss:16` · v sérii o **10+ intervalech** ubere dvouciferné pořadové
  číslo každému poli v tom řádku 13,4 px. Řešilo by to `min-width: 2ch` na indexu; nechávám
  to na tom, jestli takhle dlouhé série vůbec děláš.

**Co reviewery prošlo a stojí za zmínku**

Rozestup mezi řádky po zrušení drop zón **sedí na milimetr** (2 rem dřív i teď, změřeno).
`fill='currentColor'` skutečně přebije natvrdo zapsaný `fill="#000000"` — `@svgr/core` má
`expandProps: 'end'`. Specificita obou mých override pravidel je v pořádku. `cssTarget`
(`safari14`) pokrývá `min()` i `touch-action: manipulation`. Nové `aria-label`y se nikde
nerenderují jako text, takže delší český překlad se nemá kam nevejít. A jeden vedlejší nález:
`Cross` se do 2rem tlačítka s `overflow: hidden` dosud kreslil v nativních **1280×1280**, takže
vidět byl jen jeho vystřižený střed — explicitní velikost to mimochodem spravila.
