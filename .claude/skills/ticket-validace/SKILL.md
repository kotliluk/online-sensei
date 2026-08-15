---
name: ticket-validace
description: Fáze 4 flow Online Sensei — spustí typecheck, lint a testy a opraví chyby do zelena, s tvrdým pravidlem nepřepisovat testy jen aby prošly. Použij po implementaci nebo po aplikaci review fixů.
effort: medium
---

# Fáze 4 — Validace

Cíl: **zeleno** před review a před předáním uživateli.

## Krok 1 — Spusť kontroly

```bash
yarn typecheck
yarn lint
yarn test
```

- ⚠️ **Nespouštěj `yarn build`.** `typecheck` + `lint` + `test` řeknou totéž a rychleji;
  build navíc přepíše `build/`.
- U cíleného doběhu jde vitest zúžit: `yarn test src/utils/tests/csv.test.ts`. Než ohlásíš
  zeleno, **pusť celou sadu** — je krátká.

## Krok 2 — Smyčka do zelena

- **Chyby typecheku a lintu: všechny do nuly.**
- **Lint warningy: nesmí přibýt nové.** ~74 preexistujících (hlavně
  `react-hooks/exhaustive-deps`) je známý dluh — porovnej počet, ne pocit:
  `yarn lint 2>&1 | tail -3`. Přibyl-li warning v souboru, kterého se diff dotkl, **oprav
  ho**; cizí warningy neuklízej, to je jiný ticket.
- Testy do zelena.

Iteruj s **rozumným capem (~5 pokusů)**. Když to po nich nejde, **zastav a reportuj** —
nezacyklíš se.

## Krok 3 — Integrita testů (TVRDÉ PRAVIDLO)

Když test očekává X a kód dělá Y, **NIKDY test automaticky nepřepiš, aby prošel.**

> **STOP → ANALYZUJ → ZEPTEJ SE.**
> „Test očekává X, kód dělá Y. Mám opravit kód, nebo je špatně test?"

Test upravený jen proto, aby zezelenal, je horší než žádný test — tiše schová regresi.
Totéž platí pro `skip`, `only` a změkčené asserty.

## Krok 4 — Výstup

Napiš **konkrétně**, co běželo a s jakým výsledkem (kolik testů, kolik warningů), ne
„hotovo". Když něco zůstalo červené, řekni to na rovinu i s výstupem.

**Zeleno tady neznamená ověřeno.** Chyby, kvůli kterým se v tomhle projektu nejčastěji
vracelo, testy neviděly — žijí v prohlížeči na telefonu. Ty patří do „Ověřeno na" při
uzávěrce.

Po zelené pokračuj fází 5 — `ticket-review`.
