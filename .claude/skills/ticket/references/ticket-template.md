# Šablona ticketu — `tickets/<slug>.md`

**Jeden ticket = jeden soubor.** Sekce přibývají, jak flow postupuje; starší se nepřepisují.
Česky. Sekce, která pro daný ticket nedává smysl, se **vynechá** — prázdný nadpis je horší
než chybějící.

## Limity délky (tvrdé)

| Sekce           | Strop     | Kdy je porušený limit v pořádku |
| --------------- | --------- | ------------------------------- |
| `A — Nápad`     | bez limitu (append-only přepis toho, co uživatel řekl) | vždy |
| `B — Zadání`    | ~25 řádků | nikdy |
| `C — Analýza`   | ~50 řádků | nikdy |
| `D — Hotovo`    | ~25 řádků | nikdy |
| `Review`        | ~30 řádků | nikdy |

**Zastřešující pravidlo: dokumentace ticketu nesmí být delší než diff, který popisuje.**
Když se k tomu blížíš, není řešení psát hustěji — je to signál, že ticket měl jít
[malou dráhou](../SKILL.md#dvě-dráhy) nebo se rozdělit.

---

```markdown
---
slug: <english-kebab-slug>
title: <Český název>
status: spec # spec | analysis | approved | wip | review | done | dropped
branch: <slug>
---

# <Český název>

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-15

<Co uživatel řekl, jeho slovy.>

## B — Zadání

**Problém:** <Koho to pálí. 1–3 věty. Bolest, ne řešení.>

**Rozsah:** <Co uživatel uvidí. Odrážky.>

**Mimo rozsah:** <Co vědomě neděláme — ať se to při review nebere jako mezera.>

**Akceptační kritéria:**

- [ ] <situace → očekávané chování>

## C — Analýza

**Reuse / gap:**

| Dílčí věc | Stav | Kde to žije / co reusnu |
| --------- | ---- | ----------------------- |
| <věc>     | ✅ existuje / ❌ chybí | `path:line` |

**Kam to přijde:** <Konkrétní soubory — nové i měněné.>

**Postup:** <Co & kde, ne hotový kód. Nejdřív pojmenuj vzor, na kterém se staví.>

**Plán testů:** <Konkrétní testy: vstup → výstup. Pokrývá všechna akceptační kritéria.>

- [ ] <test>

**Rizika a zařízení:** <Co může selhat jen na reálném telefonu — sdílení, audio, blob,
secure context, layout. Když se změna prohlížečových API nedotkne, napiš „netýká se".>

**Předpoklady:** <Za čeho jdu, když zadání mlčí. Živý seznam — doplňuje se i při
implementaci.>

**Otevřené otázky:** <Jen to, co nejde bezpečně předpokládat. Zbytek patří výš.>

## D — Hotovo

**Co se udělalo:** <2–5 vět. Odkaz na commity.>

**Odchylky od B/C:** <Co se udělalo jinak než v plánu a proč. Když nic, napiš „žádné".>

**Gotchas:** <Co příště překvapí. Tohle je sekce, kterou budoucí ty doopravdy přečteš.>

**Ověřeno na:** <desktop Chrome / iOS Safari / Android Chrome — nebo „jen automatické
testy, na zařízení neověřeno".>

## Review

<Doplní `/ticket-review`. Nálezy s jistotou, stavem a `path:line`.>
```

---

## Poznámky

- **Akceptační kritéria musí být testovatelná.** „Sdílení bude fungovat líp" není kritérium.
  „Když `navigator.canShare` chybí, tlačítko stáhne soubor a jeho popisek říká Stáhnout" je.
- **Plán testů je kontrakt.** Implementace proti němu dělá TDD, review podle něj kontroluje
  pokrytí. Vágní plán = vágní zbytek flow.
- **Co jsi neověřil v kódu, není fakt** — patří to do „Otevřené otázky", ne do „Postup".
- `status:` ve frontmatteru je **jediný zdroj pravdy o tom, jestli je gate otevřený**.
  Ne tvoje paměť, ne kontext session.
