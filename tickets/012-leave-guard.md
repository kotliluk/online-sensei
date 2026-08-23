---
id: 012
slug: leave-guard
title: Logo v hlavičce obchází potvrzení odchodu
status: idea
branch: leave-guard
---

# Logo v hlavičce obchází potvrzení odchodu

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Vyndáno z ticketu 007, protože je to
produktové rozhodnutí přes pět obrazovek, ne oprava. Uživatel:

„založ je taky, ať na ně pak odděleně kouknu a rozhodnu co s nimi"

**Nález:** ticket 003 dal na „Zpět" z rozehraného turnajového zápasu potvrzovací dialog.
Ten guard ale visí **jen na `handleGoBack`**. `PageHeader` (`PageHeader.tsx:11`) je obyčejný
`<Link to='/'>` renderovaný v `App.tsx:23` nad všemi routami — na telefonu je to 5rem pruh
přes celou šířku kousek nad skóre. Ťuknutí na „OnlineSensei" odejde okamžitě, bez ptaní,
a unmount cleanup zahodí log, skóre i fauly. Stejně dopadne prohlížečové „zpět";
v repu není `useBlocker` ani `beforeunload` (ověřeno grepem).

U **skupinových stopek** je to horší: časy žijí jen ve state komponenty (ticket 006 to
vědomě nemění), tlačítko Zpět je za běhu měření schválně disabled — a logo funguje i tehdy.
Osm závodníků, šest doběhlých časů, jedno ťuknutí a je po měření.

**Proč to není bugfix:** je potřeba rozhodnout rozsah, a to rozhodnutí je uživatelovo:

- Má se logo blokovat **na všech pěti** feature obrazovkách, nebo jen tam, kde je co ztratit
  (kumite zápas, stopky s uloženými časy)?
- Má se hlídat i **prohlížečové zpět** a zavření záložky (`beforeunload`), nebo stačí logo?
  `beforeunload` ukáže systémový dialog, který se nedá otextovat a na telefonu působí jinak
  než modál appky.
- Nebo je levnější **logo na feature obrazovkách vůbec nevykreslovat**, případně z něj
  udělat neaktivní znak? Tím zmizí celá třída úniků bez jediného guardu — ale ubere to
  cestu domů člověku, který ji používá záměrně.

Ticket 003 se svým zadáním vědomě omezil na tlačítko „Zpět", takže tohle není jeho
nedodělek, ale rozšíření rozsahu — a to se má rozhodnout, ne dotlačit.

**Souvisí:** stopky by kromě guardu potřebovaly i vlastní potvrzovací modál (dnes žádný
nemají) a texty do `cs.ts` i `en.ts`. Vzor je `LeaveFightModal` z ticketu 003.

## Review

<!-- doplní /ticket-review -->
