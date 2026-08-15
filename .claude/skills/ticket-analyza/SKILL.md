---
name: ticket-analyza
description: Fáze 2 flow Online Sensei — ze zadání (sekce B) vytvoří krátkou technickou analýzu (sekce C ticketu) — reuse/gap, kam co přijde, plán testů, rizika na reálných zařízeních, předpoklady — a ZASTAVÍ na tvrdém gatu před psaním kódu. Použij po schválení zadání na normální dráze.
effort: high
---

# Fáze 2 — Analýza (→ tvrdý gate)

**Vstup:** sekce `B — Zadání`.
**Výstup:** sekce `C — Analýza` (**~50 řádků**) + **TVRDÝ STOP**.

Cíl: **vyčerpat nejednoznačnost dopředu.** Analýza je jediný human gate před psaním kódu —
po schválení běží flow autonomně až k review.

## Tvrdé guardraily

- **READ-ONLY na kód.** Jediný povolený zápis je do `tickets/<slug>.md`.
- **„Co & kde", ne „jak".** Cesty souborů, názvy funkcí, tvar stavu — ne hotová těla.
- **Nehádej.** Co jsi v kódu neověřil, **není fakt** → „Otevřené otázky".
- **Každý claim ukotvi** na `path:line`.
- **Analýza nesmí být delší než diff, který popisuje.** Když ji nedokážeš vejít do limitu,
  problém není v psaní — ticket je moc velký a **patří rozdělit**. Řekni to.

## Krok 1 — Zadání a precedenty

Vytáhni z `B` **akceptační kritéria** — proti nim se celá analýza poměřuje.

Pak projdi sekce **`D — Hotovo`** hotových ticketů (`tickets/*.md`), hlavně „Odchylky"
a „Gotchas". Je to jediná existující knihovna precedentů: co se posledně ukázalo dražší,
než zadání čekalo, a jaká past se už jednou spustila. Když něco platí i tady, **pojmenuj to
v analýze** s odkazem na zdrojový ticket. Precedent, který si jen tiše zapamatuješ, se ztratí.

## Krok 2 — Průzkum kódu

U větší změny spusť **v jedné zprávě 2 `Explore` subagenty** (read-only) — typicky dělené
na *logika a stav* (`src/logic/`, `src/redux/`, `src/types/`, `src/utils/`) a *obrazovky*
(`src/components/`, `src/pages/`, SCSS). U menší si to projdi sám; dva agenti na
třísouborovou změnu jsou dražší než užitečnější.

Ať zmapují:

- **Dotčené soubory a vstupní body.**
- **Analogický vzor (POVINNÉ).** Než navrhneš cokoli nového, najdi v repu **existující vzor**
  a řekni, ke kterému se přimkneš a proč. Nový kód je poslední možnost. Vzory, které tenhle
  repo má připravené: `src/logic/urlState/` (parsování s fallbackem po jednotlivých polích),
  `src/logic/timing/` (pausable čas), `src/redux/<feature>/` (řez state–actions–reducer–selector),
  `src/components/atoms/` (vstupy), `src/logic/localStorage/access.ts` (persistence).
- **Co jde reusnout** — hotové utility, typy, hooky.
- **Testovací vzor** pro danou oblast.

## Krok 3 — Sepiš `C`

Podle [šablony](../ticket/references/ticket-template.md). Na co si dát pozor:

- **Reuse / gap tabulka je nejcennější sekce.** Dej ji, kdykoli to jde.
- **Tvar stavu a migrace.** Když se mění, co je v `localStorage` nebo v URL, **řekni, co se
  stane starým datům**. Uživatel může mít rozjetý turnaj z minulého víkendu; tenhle projekt
  nemá migrace, takže odpověď musí být „přečte se s fallbackem" nebo „vědomě se zahodí".
- **Plán testů = akceptační kritéria.** Konkrétní testy, vstup → výstup. Cíl pro TDD.
- **Rizika a zařízení.** Dotýká se změna `navigator.*`, audia, blobů, souborů, fullscreenu,
  wake locku, secure contextu nebo layoutu? Pak sem patří, co se má ověřit na telefonu.
  Když ne, napiš „netýká se" — prázdná sekce vypadá jako opomenutí.
- **Předpoklady vs. Otevřené otázky.** Jde to bezpečně předpokládat? → Předpoklady.
  Nejde? → Otevřené otázky. Na to je gate.

## Krok 4 — STOP

**Nepiš žádný kód.** Nastav `status: analysis` — to znamená „napsaná, čeká na gate",
ne „schválená". Vypiš do chatu:

1. cestu k ticketu,
2. **otevřené otázky inline**, ať se dá odpovědět rovnou,
3. jednou větou: navrhovaný přístup + hlavní riziko.

Odpovědi zapracuj **do souboru** (a když se mění rozsah, i do `B`) **před** implementací.
Teprve pak přepni na `status: approved`. Dokud tam stojí `analysis`, je gate otevřený
a nikdo — ani ty v příští session — nesmí začít kódit.
