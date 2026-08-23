---
id: 013
slug: interval-reorder-touch
title: Přeuspořádání intervalů na dotyk
status: idea
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

## Review

<!-- doplní /ticket-review -->
