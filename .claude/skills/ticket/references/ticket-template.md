# Šablona ticketu — `tickets/<id>-<slug>.md`

**Jeden ticket = jeden soubor.** Sekce přibývají, jak flow postupuje; starší se nepřepisují.
Česky. Sekce, která pro daný ticket nedává smysl, se **vynechá** — prázdný nadpis je horší
než chybějící.

`id` je trojmístné zero-padded pořadové číslo (`001`, `002`, …) — **nikdy se nerecykluje**,
takže je z názvů souborů vidět, co po čem přišlo. Další volné číslo = nejvyšší existující
v `tickets/` + 1; žádný board se kvůli tomu neudržuje.

## Délka: proporcionalita, ne strop

Dokumentace roste **s tou změnou**, ne s ambicí. Orientační body, ne limity:

| Rozsah změny                                        | Kolik dokumentace to unese                    |
| --------------------------------------------------- | --------------------------------------------- |
| drobnost — jeden soubor, jasná oprava                | pár řádků zadání, **analýza vůbec žádná** ([malá dráha](../SKILL.md#dvě-dráhy)) |
| běžná iterace — stovky řádků                         | zadání kolem 25 řádků, analýza kolem 50        |
| nová funkce — nová obrazovka, nový tvar stavu, víc feature | tolik, kolik potřebuje                    |

**Tou hranicí, která platí vždy, není počet řádků, ale užitečnost:** co nepomůže
implementaci ani review, je vata a patří pryč. Sto řádků analýzy na desetiřádkovou opravu
je špatně bez ohledu na to, jak dobře je to napsané; padesát řádků na novou obrazovku může
být málo.

Když dokumentace vyjde delší než diff, **je to otázka, ne chyba**: dává ten ticket pořád
smysl jako jeden kus, nebo se měl rozdělit? Odpověz si na ni a pokračuj — u průzkumné
nebo rizikové změny je delší analýza legitimní výsledek.

---

```markdown
---
id: <001>
slug: <english-kebab-slug>
title: <Český název>
status: idea # idea | spec | analysis | approved | wip | review | done | dropped
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
