---
id: 011
slug: clock-wall-time
title: Hodiny mají měřit uplynulý čas, ne počítat tiky
status: idea
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
