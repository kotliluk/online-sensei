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
