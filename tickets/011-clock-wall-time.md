---
id: 011
slug: clock-wall-time
title: Hodiny mají měřit uplynulý čas, ne počítat tiky
status: approved
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
