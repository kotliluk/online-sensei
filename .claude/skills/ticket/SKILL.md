---
name: ticket
description: Orchestrátor vývojového flow Online Sensei — vede změnu od nápadu po PR připravený k review (zadání → analýza → implementace → validace → review → uzávěrka), s tvrdým gatem před psaním kódu. Použij, když se má něco naimplementovat, opravit nebo rozpracovat z nápadu.
---

# Ticket — orchestrátor

Vede jednu změnu jako pipeline fází. Cíl: kvalitní výsledek s **minimem zásahů uživatele**,
ale s **tvrdým gatem tam, kde je omyl drahý**. Každá fáze je samostatný skill a jde spustit
izolovaně. **Výstupem je PR na GitHubu**, ne lokální diff — merge zůstává uživateli.

**Vstup:** `/ticket <id nebo slug>` (existující ticket) nebo `/ticket <popis nápadu>`
(založí nový).

Artefakt je **jeden soubor** `tickets/<id>-<slug>.md` se sekcemi A–D a Review. Šablona
a **měřítko délky**: [`references/ticket-template.md`](./references/ticket-template.md).

## Dvě dráhy

Tenhle projekt se vyvíjí většinou po iteracích v řádu **stovek řádků**, ne tisíců. Plná
flow je na ně občas těžší než ta změna samotná, proto **hned na začátku odhadni rozsah
a řekni, kterou dráhou jdeš:**

| Dráha       | Kdy                                                                 | Co se děje                                                     |
| ----------- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| **malá**    | jeden až dva soubory, jasná oprava, žádný nový tvar stavu, ~do 100 řádků | `A` + `B` naráz, **`C` se vynechá** (do `B` přibude 3–5 odrážek: kam to přijde, co reusnu, co otestuju), **jeden gate** po `B` |
| **normální**| nová obrazovka, nový tvar stavu, dotčené víc než dvě feature, nejasný postup | plná flow s gatem po `C`                                        |

Volbu **navrhni a nech si ji potvrdit** jednou větou — nerozhoduj ji potichu. Když se
v půlce ukáže, že je změna větší, než vypadala, **řekni to a přepni na normální dráhu**;
dopsat `C` v půlce implementace je levnější než ji nemít.

## Gate kontrakt

| Gate               | Kdy                    | Co se děje                                                          |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| _měkká pauza_      | po `B`                 | ukážeš zadání, uživatel doupraví nebo schválí                        |
| **TVRDÝ STOP**     | po `C` (malá dráha: po `B`) | **žádný kód**, dokud uživatel neschválí                         |
| **finální**        | po uzávěrce            | uživatel dělá code review **v PR na GitHubu**                        |

Mezi tvrdým gatem a finálním review běž **autonomně**. Zastav se **jen u tvrdého blokeru** —
rozhodnutí, kde špatná volba znamená přepsat velkou část práce.

**Drobnou nejasnost neřeš otázkou**, ale **explicitním předpokladem** zapsaným do
`C` → „Předpoklady" (na malé dráze do `B`). Uživatel je uvidí při review.

> Proč je gate zrovna tady: **změnit dokument je levné, přepsat kód drahé.**

## Globální pravidla

Platí `CLAUDE.md`. Nad rámec toho:

- **Nikdy necommituj na `main` a nikdy na `main` nepushuj** — `main` se deployuje na
  GitHub Pages. Vždy feature branch pojmenovaná **slugem ticketu bez id** (`fight-log` —
  ne `feat/fight-log` ani `001-fight-log`; tak vypadají branche v tomhle repu). Hook
  `guard.mjs` to stejně zablokuje.
- Zdroj pravdy o stavu ticketu je **`status:` ve frontmatteru**, ne kontext session.
- **Nepředstírej zeleno.** Co jsi nespustil, neproběhlo; co jsi neověřil na zařízení,
  není ověřené.

## Fáze

### 0 — Rozpoznej vstup

- **`/ticket <id nebo slug>`** → načti `tickets/<id>-<slug>.md` (stačí kterákoli půlka
  jména, dohledej ji). Když neexistuje, řekni to a nabídni založení.
- **`/ticket <popis nápadu>`** → projdi `tickets/` (existující i `done`), jestli k tomu už
  něco není. Když ne, založ nový:
  1. vezmi **další volné `id`** — nejvyšší číslo v `tickets/` + 1, trojmístné zero-padded
     (`001`), **nikdy nerecykluj**;
  2. odvoď krátký **anglický kebab-case slug**;
  3. vytvoř `tickets/<id>-<slug>.md` se sekcí `A — Nápad`: **doslova to, co uživatel řekl**,
     s datem, append-only.

Kde ve flow jsi, poznáš podle `status:`; které sekce existují, je jen kontrola navíc.

### 1 — Zadání → skill `ticket-feat`

Doplní sekci `B`. Pak **měkká pauza**: ukaž shrnutí, nech uživatele upravit.

### 2 — Analýza → skill `ticket-analyza` → **TVRDÝ STOP**

Doplní sekci `C`. Na malé dráze se **přeskakuje** — místo ní shrne `ticket-feat` postup
do odrážek v `B` a gate padá už tam.

**ZDE STOP. Nepiš žádný kód.** Vypiš cestu k ticketu, otevřené otázky a jednou větou
navrhovaný přístup + hlavní riziko. Pokračuj až po explicitním schválení. Odpovědi
zapracuj **do souboru**, pak přepni `status:` na `approved`.

### 3–5 — Autonomně po schválení

1. **`ticket-implementace`** — branch, TDD proti „Plánu testů", průběžné commity,
   push a **draft PR**.
2. **`ticket-validace`** — typecheck + lint + testy do zelena.
3. **`ticket-review`** — paralelní revieweři → sekce `Review` → auto-fix jistých nálezů →
   **znovu `ticket-validace`** → push a **PR na ready**.

### 6 — Uzávěrka → finální gate

1. **Projdi akceptační kritéria z `B` položku po položce** a ke každému napiš, čím je
   naplněné — **soubor a test**, ne dojem. Review to nenahradí: revieweři soudí, co
   v diffu **je**, kdežto nenaplněné kritérium je něco, co tam **není**, a chybějící kód
   nemá kdo najít. Výstup: splněno / nesplněno / vědomě odloženo. Nesplněné je blocker.
2. **Aktualizuj `README.md`**, když se změnilo chování, které uživatel uvidí. `README.md`
   popisuje výsledný stav, takže neaktualizovaný po mergi rovnou lže — a je to jediná
   dokumentace, kterou tenhle projekt má.
3. Napiš sekci `D — Hotovo` včetně **„Ověřeno na"**. Když ruční ověření na telefonu
   nedávalo smysl, napiš proč; když dávalo a neproběhlo, **napiš to taky** a nabídni
   uživateli `yarn dev:https` a konkrétní kroky, co má na telefonu zkusit.
4. `status: review`.
5. Vypiš uživateli:
   - branch + `git diff main...HEAD --stat`,
   - soupis akceptačních kritérií (splněno / nesplněno / odloženo),
   - co našlo review, **co se auto-fixlo a co zůstalo na něj**,
   - **Předpoklady**, za kterých se šlo,
   - co chce ověřit na telefonu,
   - **URL PR** — review se dělá tam, ne nad lokálním diffem. PR má v tuhle chvíli být
     pushnutý a ready (založila ho fáze 3, překlopila fáze 5); když z nějakého důvodu není,
     doděláš to tady.

## Re-run a pokračování v nové session

Každá fáze je samostatný skill (`/ticket-analyza`, `/ticket-review`, …). Při návratu
k rozdělanému ticketu se řiď **`status:`, ne pamětí**: `approved` → jdi implementovat;
`analysis` → gate je pořád otevřený, ukaž analýzu a čekej. Existuje-li branch ticketu,
navaž na ni.
