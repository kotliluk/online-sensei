---
name: ticket-feat
description: Fáze 1 flow Online Sensei — z nápadu (sekce A) udělá krátké produktové zadání (sekce B ticketu) — problém, rozsah, akceptační kritéria — a zastaví na měkké pauze. Na malé dráze rovnou přidá i pár technických odrážek místo celé analýzy. Použij jako první krok ticketu.
---

# Fáze 1 — Zadání

**Vstup:** `tickets/<slug>.md`, sekce `A — Nápad`.
**Výstup:** sekce `B — Zadání` (**~25 řádků**) + **měkká pauza**.

## Tvrdá pravidla

- **Produkt, ne technika.** Piš **co a proč**, ne **jak**. (Výjimka: malá dráha, viz níž.)
- **`A` je append-only.** Nikdy ho nepřepisuj ani „neuklízej".
- **Přečtené za minutu.** Hustota > délka. Když se blížíš k limitu, škrtej, nepiš hustěji.
- **Nehádej.** Co z nápadu nevyplývá a je to podstatné → „Otevřené otázky", ne vymyšlený
  detail.

## Postup

1. Přečti `A` (a `B`, pokud existuje — pak ho **doplňuješ**, ne přepisuješ).
2. Projdi `README.md` a hotové tickety (`tickets/*.md`, sekce `D`), jestli se to netýká
   něčeho už rozhodnutého nebo odloženého.
3. Sepiš `B` podle [šablony](../ticket/references/ticket-template.md).
4. **Akceptační kritéria piš testovatelně** (situace → očekávané chování). Stanou se cílem
   pro TDD — je to nejcennější část dokumentu.
5. Nezapomeň na **Mimo rozsah**.
6. Zamysli se nad tím, co je v tomhle produktu skoro vždy relevantní a v zadání skoro vždy
   chybí: **obě jazykové mutace** (`cs.ts` i `en.ts`), **chování na telefonu**, a **co se
   stane s rozdělaným stavem** v `localStorage` nebo v URL, když se tvar dat změní.

## Malá dráha

Když orchestrátor zvolil malou dráhu, `C` se psát nebude — proto do `B` přidej na konec
**3–5 odrážek**: kam kód přijde (`path`), který existující vzor přebíráš, co otestuješ,
a čím to může selhat na reálném zařízení. Nic víc; jakmile ti to začne růst pod rukou,
je to signál, že ticket patří na normální dráhu — **řekni to.**

## Doptání

Když je otázka **genuinně produktová a blokující** (bez odpovědi nejdou napsat rozumná
akceptační kritéria), zeptej se přes `AskUserQuestion` — max. 2–3 otázky s variantami
a jejich dopadem. Ostatní nech v dokumentu.

## Konec — měkká pauza

Nastav `status: spec`. Vypiš cestu k ticketu, **3–5 vět shrnutí** (co se bude dělat a co ne)
a otevřené otázky. Řekni uživateli, ať zadání **doupraví přímo v souboru** a dá vědět.

Pak: normální dráha → `ticket-analyza`. Malá dráha → **tvrdý gate je už tady**, čekej na
schválení a teprve po něm přepni `status: approved` a pokračuj implementací.
