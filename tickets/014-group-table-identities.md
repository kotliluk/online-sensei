---
id: 014
slug: group-table-identities
title: Uzdravit skupinovou tabulku uloženou před opravou zrcadlení
status: idea
branch: group-table-identities
---

# Uzdravit skupinovou tabulku uloženou před opravou zrcadlení

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-25

Z review ticketu 007 (`correctness`, jistota 88). Ticket 007 opravil, že se výsledek zápasu
zapsaný do zrcadlené buňky skupinové tabulky přebíral i s cizím `uuid`
(`types/tournament.ts:170`). Oprava ale brání **vzniku** té škody, ne tomu, co už je
uložené.

Stará verze při prvním uložení zápasu přepsala zrcadlené buňce `uuid` na `result.uuid`
a `oppositeFight` na její vlastní `uuid` — a `LS_ACCESS.group.set` to uložilo. Každý
skupinový turnaj rozehraný před updatem tedy má obě buňky páru se **stejným `uuid`**.
Při dalším uložení pořád obě spadnou do první větve `updateGroupTable`
(`f.uuid === result.uuid`) a dostanou nepřehozený výsledek — oba závodníci skončí
s prohrou. `isValidFight` unikátnost `uuid` nekontroluje, takže se to při načtení
nezachytí.

Akceptační kritérium ticketu 007 „znovuotevřený a opravený skupinový zápas zapíše do
zrcadlené buňky výsledek s prohozenými stranami" tedy pro rozdělaná data **neplatí**.

Dvě cesty, které review navrhlo:

1. **Přerazit identity při načtení** — pro každé `i,j` znovu odvodit
   `fights[i][j].oppositeFight = fights[j][i].uuid` a duplicitní `uuid` přejmenovat.
2. **Brát v `updateGroupTable` jako „ten zápas" jen první buňku** s odpovídajícím `uuid`
   a každou další shodu považovat za zrcadlo.

Rozhodnutí, které z toho (a jestli vůbec — turnaj se obvykle dohraje během jednoho dne,
takže dotčených dat může být nula), čeká na uživatele.
