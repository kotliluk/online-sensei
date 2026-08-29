---
id: 011
slug: clock-wall-time
title: Hodiny mají měřit uplynulý čas, ne počítat tiky
status: review
branch: clock-wall-time
---

# Hodiny mají měřit uplynulý čas, ne počítat tiky

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Vyndáno z ticketu 007, protože to
nemění řádek, ale kontrakt — a uživatel si to chtěl prohlédnout zvlášť:

„založ je taky, ať na ně pak odděleně kouknu a rozhodnu co s nimi"

**Nález:** `PausableInterval` odpočítává tak, že si počítá vlastní callbacky —
oba volající dělají `clock.restart(() => setTime(prev => prev - 1), 1000)`. Když prohlížeč
tiky zahodí (záložka na pozadí, zamčený telefon, kde iOS JS úplně uspí), nedožene je
a napočítaný čas se rozejde s uplynulým. Nikde v `src/` není `visibilitychange` ani nic,
co by čas dopočítalo.

Sesterská `PausableStopwatch` ve stejné složce to dělá správně — přes rozdíly `Date.now()`.
Dvě třídy vedle sebe měří čas dvěma neslučitelnými způsoby.

Změřeno reviewerem na stejném výpadku (1 s zablokovaný event loop):

```
PausableInterval : wall 2002 ms, ticks 9 (= 900 ms napočítáno), ztraceno 1102 ms
PausableStopwatch: wall 2003 ms, reported 1911 ms
```

**Proč to není bugfix:** mění se signatura callbacku (dekrement → nastavení hodnoty),
sahá to na `KumiteTimerScreen.tsx:169` i `IntervalTimerScreen.tsx:100`, a hlavně se to
ověřuje **zamčeným telefonem**, ne testem. Odhad ~20 řádků ve třídě plus úprava dvou
volajících — jenže je to hodinky časomíry, tedy to, co appka dělá především.

**Otevřená otázka k rozhodnutí:** co má appka dělat s časem, který uběhl, když byla
uspaná? U kumite zápasu je „dopočítat" pravděpodobně správně (čas na tatami běžel dál),
u intervalového tréninku možná taky, ale stojí za to to říct nahlas dřív, než se to
naimplementuje — může to znamenat, že se uživatel vrátí k obrazovce, kde už série
skončila.

## B — Zadání

### Co se mění

`PausableInterval` má přestat počítat vlastní callbacky a začít číst `Date.now()`, stejně
jako to vedle ní dělá `PausableStopwatch`. Callback dostane **kolik celých intervalů
uplynulo** od minulého tiku: za běžného běhu vždycky `1`, po výpadku (záložka na pozadí,
zamčený telefon) tolik, kolik jich doopravdy uteklo.

**Rozhodnutí k otevřené otázce z `A`:** čas, který uběhl, když byla appka uspaná, se
**dopočítá**. Zápas na tatami běžel dál, takže hodiny mají po probuzení ukazovat, kolik
z něj doopravdy zbývá — ne kolik tiků prohlížeč stihl doručit.

Vedle toho se opraví druhý nález ze sekce Review: `PausableTimeout` po vystřelení nevynuluje
`timeoutId`, takže vypršelý timeout se tváří, že běží, a `pause()` + `resume()` ho vystřelí
podruhé.

### Postup

- `PausableInterval`: `setInterval` nahradí řetěz `setTimeout`ů mířících na **absolutní
  okamžik** dalšího tiku. Z rozdílu `Date.now()` proti němu se spočítá, kolik intervalů
  uplynulo, a callback se zavolá **jednou s tím počtem** — ne tolikrát, kolik se jich
  zameškalo.
- Explicitní příznak `running` místo odvozování stavu z `timeoutId`. Bez něj nejde poznat
  `pause()` zavolanou **zevnitř** callbacku, což je přesně ta cesta, kterou dnes hodiny
  po dosažení nuly ožívají (viz komentář v `KumiteTimerScreen.tsx:140`).
- `KumiteTimerScreen`: `handleTick(elapsedSeconds)`, odečet místo dekrementu, atoshibaraku
  na **překročení** patnáctky. Narrow fix `phase === 'finished' → clock.pause()` může
  odejít — po opravě třídy je mrtvý.
- `IntervalTimerScreen`: odečet s ořezem na nule (bez ořezu by `currTime` skočil pod nulu,
  efekt na `currTime === 0` by se nechytil a série by se zasekla).
- `PausableTimeout`: vystřelení vynuluje `timeoutId`; `resume()` se chytá jen toho, co bylo
  opravdu pauznuté, ne vypršelého timeoutu se zbytkem nula.

### Akceptační kritéria

1. `PausableInterval` odvozuje uplynulý čas z `Date.now()`; po zablokovaném event loopu
   dožene, co se zameškalo.
2. Jeden zameškaný úsek = **jedno** zavolání callbacku s počtem intervalů, ne série volání.
3. `pause()` zavolaná zevnitř callbacku hodiny skutečně zastaví.
4. Pauzovací aritmetika zůstává: `resume()` dojede rozpracovaný interval, ne celý znovu.
   Stávající testy v `src/logic/timing/tests/` platí beze změny.
5. Kumite: po výpadku ukazují hodiny čas odpovídající uplynulému, ne počtu tiků.
6. Kumite: END zazní a zaloguje se **jednou**, i když se na nulu dojde skokem.
7. Kumite: atoshibaraku zazní při překročení 15 s (ne jen při přesné rovnosti), a ruční
   nastavení času dál nezvoní.
8. Interval timer: čas se dopočítá uvnitř intervalu a na hranici se ořízne na nulu.
9. Interval timer: `currTime` nikdy neklesne pod nulu.
10. `PausableTimeout`: po vystřelení `isRunning()` vrací `false` a `pause()` + `resume()`
    ho nevystřelí podruhé.
11. Žádný nový `react-hooks` warning; typecheck, lint i testy zelené.
12. Ověřeno na telefonu se zamčenou obrazovkou — nebo je v `D` napsáno, že to neproběhlo.

### Plán testů

- `pausableInterval.test.ts`: dopočítání přes `Date.now()` posunutý proti fake timerům
  (přesně ten výpadek, který změřil reviewer v `A`); jedno volání s `N`; `pause()` zevnitř
  callbacku; stávající pauzovací testy nezměněné.
- `pausableTimeout.test.ts`: zamčený test „a spent timeout still calls itself running"
  se překlápí na opravené chování.
- `KumiteTimerSignals.test.tsx`: skok přes patnáctku, skok na nulu (horn a log jednou),
  správný čas na displeji po skoku.
- `IntervalTimerScreen.test.tsx`: skok uvnitř intervalu, ořez na hranici intervalu.

### Předpoklady

- **Zvuk se za spánek nepřehrává zpětně, stav ano.** Atoshibaraku se pouští při překročení
  patnáctky — tvrzení „zbývá málo" po probuzení pořád platí, a nepustit ho vůbec by
  znamenalo, že v tom zápase nezazní. Konec zazní i skokem: je to způsob, jakým appka říká
  „zápas skončil", a tichý druhý konec by byl nová cesta kódem.
- **Interval timer dopočítává jen uvnitř aktuálního intervalu**, přetečení přes hranici
  zahazuje. Dopočítat celou sérii znamená přemodelovat stav obrazovky na jednu časovou osu
  a vyřešit dávku pípnutí za přeskočené hranice — to je vlastní ticket, ne dvacet řádků.
- **`PausableStopwatch` se v chování nemění**; přepisuje se v ní jen čtení hodin na stejný
  tvar (`Date.now()`), aby tři třídy vedle sebe nečetly čas dvěma způsoby.

## Review

<!-- doplní /ticket-review -->

### 2026-08-26

Z ticketu 008, který ty tři třídy poprvé obestavěl testy. Vedle hlavního nálezu výš vyšly
najevo **dvě další věci, které `PausableTimeout` dělá s časem špatně** — a na jednu z nich
odkazuje komentář v `src/logic/timing/tests/pausableTimeout.test.ts`, tak ať má kam:

**Vypršelý timeout se tváří, že běží.** `setTimeout` po vystřelení nevynuluje
`this.timeoutId`, takže `isRunning()` vrací `true` i pro timeout, který už dávno doběhl.
`pause()` na něm spočítá zbytek `0` a `resume()` ho **vystřelí podruhé** — druhý signál
v Reakcích, který nikdo nevyvolal. Dosažitelnost je dnes mizivá: jediný volající
(`ReactionsScreen.tsx:46`) nabíjí timeout znovu v efektu hned po změně fáze, takže by
uživatel musel stisknout pauzu uvnitř jednoho renderu, a ve fázi `finished` je tlačítko
navíc `disabled`. Zamčeno testem jako současné chování, ne jako záměr.

**`isPaused()` nevolá nikdo a `isRunning()` skoro nikdo.** V celém `src/` je jediné použití
`clock.isRunning()` na `PausableStopwatch` (`GroupStopwatchScreen.tsx:166`). Obě metody na
`PausableTimeout` i `PausableInterval` jsou mrtvé API — a mrtvé API, které navíc lže, se
opravit nedá otestovat. Buď je smazat (patří spíš do ticketu 010), nebo je opravit tady
zároveň s přepisem.

Testy z ticketu 008 (`src/logic/timing/tests/`) pauzovací aritmetiku všech tří tříd hlídají,
takže přepis má proti čemu běžet.

### 2026-08-28

Paralelní revieweři **neběželi** — tahle session je má zakázané spouštět, takže review
proběhlo jako vlastní kritický průchod plus mutační testování nového kódu. Nálezy jsou
dva a oba jsou v diffu opravené:

- `pausableInterval.ts` · **hodiny se zastaví, když se systémový čas přetočí dozadu.**
  Míření na absolutní okamžik je to, co kupuje dopočítávání, a zároveň to otevírá díru,
  kterou `setInterval` neměl: telefon, co si mid-zápas stáhne síťový čas nebo dostane ručně
  přenastavenou časovou zónu, odsune hledaný okamžik pryč od čekání. Bez ošetření to
  znamená stojící hodiny na celou dobu korekce — přesně ta porucha, kvůli které tenhle
  ticket vznikl, jen novými dveřmi. Čekání je teď zastropované na jeden interval; ověřeno
  testem, který bez opravy dostane dva tiky za čtyři sekundy.
- `pausableInterval.ts` · **pomalá verze původní vady.** Mutace mřížkové aritmetiky
  (`nextTickAt += …` → přepočet od aktuálního okamžiku) neshodila **nic**. Tik, který si
  další nastavuje od momentu, kdy byl doopravdy zavolán, si to zpoždění nechává místo aby
  ho pohltil — a prohlížeč je pozdě pokaždé. Pětina sekundy na sekundu je čtyřminutové kolo
  trvající 4:48. Zamčeno testem, který nechá spánek skončit v půlce sekundy a kontroluje,
  že další tik dosedne na tu sekundu, ne na novou.

**Mutační test:** 12 mutací nového kódu napříč `pausableInterval.ts`, `pausableTimeout.ts`
a oběma obrazovkami. Po doplnění testu výš je **12 z 12 zabitých**.

## D — Hotovo

Přepis `PausableInterval` z počítání callbacků na měření `Date.now()`, oprava
`PausableTimeout` a sjednocení čtení hodin ve všech třech třídách. Pět commitů,
PR [#31](https://github.com/kotliluk/online-sensei/pull/31).

| Soubor | Co se stalo |
| --- | --- |
| `src/logic/timing/pausableInterval.ts` | řetěz timeoutů na absolutní mřížce, callback dostává počet uplynulých intervalů, explicitní `running` |
| `src/logic/timing/pausableTimeout.ts` | vystřelení vynuluje id; `resume()` zvedne jen to, co položila pauza |
| `src/logic/timing/pausableStopwatch.ts` | `new Date().getTime()` → `Date.now()`, beze změny chování |
| `KumiteTimerScreen.tsx` | `handleTick(elapsedSeconds)`, atoshibaraku na překročení 15; **odešel** workaround `phase === 'finished'` i `phaseRef`, který ho živil |
| `IntervalTimerScreen.tsx` | odečet uplynulých sekund s ořezem na nule |

Testy **483 → 498**. Produkční soubory +130 / −73 řádků, ale samotného kódu (bez komentářů
a prázdných řádků) **+66 / −59, čili netto sedm řádků** — mřížka a `running` stojí zhruba
tolik, kolik ušetřil zrušený workaround v kumite. Zbytek přírůstku jsou komentáře: proč
absolutní okamžik, proč strop na čekání, proč atoshibaraku na překročení.

### Akceptační kritéria

| # | Stav | Čím |
| --- | --- | --- |
| 1 | splněno | `pausableInterval.test.ts` → `catches up the intervals the event loop slept through` |
| 2 | splněno | `reports a whole slept-through gap in one call, not one call per interval` |
| 3 | splněno | `stays stopped when the callback is what paused it` |
| 4 | splněno | pět původních pauzovacích testů beze změny + `a pause is a pause however long the device sleeps through it` |
| 5 | splněno | `KumiteTimerSignals.test.tsx` → `the clock catches up the seconds the device slept through` (`1:28`, proti `1:58` před opravou) |
| 6 | splněno | `a fight that runs out while the device sleeps sounds the horn once` + `the log records one end…` |
| 7 | splněno; na zařízení **zpola** | `atoshibaraku sounds when a sleep carries the clock past fifteen seconds` + původní `setting the time by hand does not sound anything`. Že hraje, ověřeno na Androidu; že se pouští na překročení, slyšet nejde — viz „Ověřeno na" |
| 8 | splněno | `IntervalTimerScreen.test.tsx` → `catches up the seconds slept through inside the interval`, `stops at the end of the interval…` |
| 9 | splněno | tamtéž + původní `the clock never goes negative` |
| 10 | splněno | `pausableTimeout.test.ts` → `a spent timeout is not running, and pausing it does not fire it again` |
| 11 | splněno | typecheck 0, lint 0 errors / 59 warnings (baseline 59 — žádný nový), build prochází |
| 12 | splněno | ověřeno na Androidu 2026-08-29, viz „Ověřeno na" |

Nad rámec kritérií přibylo ošetření přetočeného systémového času a test mřížky — oboje
z review, oboje popsané výš.

### Ověřeno na

**Android (Motorola), přes `yarn dev:https` na lokální síti — 2026-08-29.** A jeden desktop
(Mac / Chrome) pro srovnání. To, kvůli čemu ticket vznikl, na zařízení **funguje**.

| # | Scénář | Výsledek |
| --- | --- | --- |
| 1 | kumite, zhasnutá obrazovka | **OK** — čas se po rozsvícení dopočítal |
| 2 | kumite, konec ve tmě (30 s zápas, ~40 s zhasnuto) | **OK s výhradou** — čas doběhl, konec zazněl **ve tmě ve správnou chvíli**, ale zkomoleně a kratší. Atoshibaraku ve tmě neslyšet. Log: jeden `START` na `0:30`, jeden `END` na `0:00` |
| 3 | kumite, atoshibaraku přes hranici (30 s zápas, ~20 s zhasnuto) | atoshibaraku ve tmě neslyšet; zbývajících 10 s po rozsvícení doběhlo a konec zazněl správně |
| 4 | interval timer | chová se, jak je popsáno — dopočítá uvnitř intervalu, na hranici stojí |
| 5 | desktop Mac / Chrome, přepnutá záložka i uspaný Mac | čas i zvuky správně — **a stejně tak v nasazené verzi**, tedy tam se defekt nikdy neprojevoval |
| 6 | **kumite s rozsvícenou obrazovkou** (dodatečně, s wake lockem z ticketu 017) | **atoshibaraku i konec zazněly čistě** |

Dvě věci z toho stojí za zapsání.

**Za zhasnutou obrazovkou je zvuk, ne kód.** Řádek 6 to rozhodl: rozsvícená obrazovka →
oba signály čistě, zhasnutá → konec zkomolený a atoshibaraku vůbec. Zhasnutý displej
nechává timery běžet, ale škrtí dekódování audia natolik, že kratší signál zmizí celý.
Tenhle ticket to neopraví ze strany hodin; opravuje to ticket 017 tím, že obrazovku
nenechá zhasnout.

**Kritérium 7 je ověřené jen zpola, a nejde to líp.** Že atoshibaraku hraje, potvrdil
řádek 6. Že se pouští na **překročení** patnáctky, a ne jen na přesné rovnosti, drží unit
test — a na telefonu to slyšet nejde, protože jediné, co tu větev spustí, je dopočítání po
zhasnuté obrazovce, a ta ten signál zároveň spolkne. Stavová část větve ověřená je: po
rozsvícení hodiny stojí na správné sekundě (řádky 1 a 3).

### Otázka k rozhodnutí, ne nález

`public/audio/ATOSHIBARAKU.mp3` a `public/audio/BEEP_A_500ms.mp3` jsou **dva soubory
s naprosto stejným obsahem** — stejné MD5 (`7d85a90572ba5a452da013eb15b51ec7`), stejných
8821 bajtů. Atoshibaraku tedy hraje totéž půlvteřinové pípnutí, jaké používá interval
timer a Reakce; přidal to commit `867bdaa` „Add atoshibaraku sound effect.".

Vyšlo to najevo při hledání, proč atoshibaraku „nezaznělo" — a jako vysvětlení to bylo
špatně, za to mohla zhasnutá obrazovka. **Otázka zůstává otevřená jen jedna: má atoshibaraku
znít jako pípnutí?** Když ano, není co řešit a tenhle odstavec může z ticketu pryč. Když
se má lišit (zvonek, hlas), je to výměna souboru v `public/audio/`, žádná změna kódu.

### Co zůstalo

- **Dopočítání přes hranici intervalu** v interval timeru — vědomě neuděláno, důvod je
  v Předpokladech. Chce vlastní ticket a jiný tvar stavu.
- **`PausableStopwatch` má stejnou expozici na přetočený systémový čas** jako měl interval
  před opravou (hlásí `now - lastStart`). Neošetřeno: nemá plánovač, který by se dal
  zaseknout, takže se to projeví chybou v odečtu, ne stojícími hodinami. Kandidát do 016.
- **`Date.now()` proti `performance.now()`** — monotónní hodiny by přetočení systémového
  času vyřešily z principu, ale nechovají se stejně přes suspend napříč prohlížeči a
  `PausableStopwatch` už `Date.now()` používá. Zvoleno sjednocení + strop, ne třetí způsob
  měření času ve stejné složce.
