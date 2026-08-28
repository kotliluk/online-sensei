# .claude — AI vývojová flow

Vede změnu od nápadu po PR připravený k review. Postavené na stejné kostře jako flow
v clubSystem, ale **zmenšené na velikost tohohle projektu**: tenhle repo se vyvíjí většinou
iteracemi po stovkách řádků, ne po tisících — a flow se má té velikosti přizpůsobit, ne
naopak.

## Co tu je

```
skills/
  ticket/                orchestrátor          → /ticket <id | slug | nápad>
    references/          šablona ticketu + měřítko délky
  ticket-feat/           fáze 1  A → B (zadání)                → měkká pauza
  ticket-analyza/        fáze 2  B → C (analýza)               → TVRDÝ GATE
  ticket-implementace/   fáze 3  branch + TDD + commity
  ticket-validace/       fáze 4  typecheck + lint + testy do zelena
  ticket-review/         fáze 5  paralelní revieweři → sekce Review → auto-fix
    agents/              correctness · react-state · device-ux · tests
hooks/
  guard.mjs              PreToolUse   — chráněné cesty, ochrana `main`, destruktivní git
  format.mjs             PostToolUse  — eslint --fix na změněný soubor
  tests/                 fixture testy guardu → node .claude/hooks/tests/run.mjs
settings.json            registrace hooků
```

Konvence projektu (jazyky, styl commitů, testy, známý dluh) žijí v kořenovém
[`CLAUDE.md`](../CLAUDE.md), ne tady — skilly na něj odkazují.

## Jak to použít

```
/ticket <popis nápadu>    # založí ticket a provede ho flow
/ticket 001               # naváže na existující ticket (jde i slugem: /ticket fight-log)
/ticket-review            # re-run jedné fáze (každá je samostatný skill)
```

Tickety žijí v `tickets/<id>-<slug>.md` a **commitují se** — sekce `D — Hotovo` hotových
ticketů je jediná knihovna precedentů, kterou tenhle projekt má, a analýza z ní čte.
(Nechceš je v repu? Stačí řádek v `.gitignore`; flow funguje dál, jen si příště nepřečte,
co posledně překvapilo.)

**Gaty:** měkká pauza po zadání → **tvrdý STOP před psaním kódu** → autonomní běh →
review v PR na GitHubu. Mezi tvrdým gatem a koncem se zastavuj jen u skutečného blokeru;
drobné nejasnosti jdou do „Předpoklady", ne do chatu.

## Čím se to liší od clubSystem

Rozdíly nejsou kosmetické — vycházejí z toho, že je to jiný produkt.

**Jeden soubor na ticket** místo pěti — `tickets/<id>-<slug>.md`, sekce A–D + Review.
Číselné `id` zůstává (je z něj vidět návaznost), ale **bez `BOARD.md`**: další volné číslo
je nejvyšší v adresáři + 1, takže není co udržovat ručně a co by hnilo. Slug je zároveň
jméno branche.

**Délka se řídí proporcí, ne stropem.** Orientačně: drobnost pár řádků a žádná analýza,
běžná iterace zadání ~25 a analýza ~50 řádků, nová funkce tolik, kolik potřebuje. Jediné
pravidlo, které platí vždycky, je *co nepomůže implementaci ani review, je vata* — sto
řádků analýzy na desetiřádkovou opravu je špatně i tehdy, když je to napsané dobře.

**Dvě dráhy.** Malá změna (jeden dva soubory, jasná oprava) `C` úplně vynechá — místo
analýzy dostane pár odrážek přímo v zadání a jediný gate. Plná flow se pouští, když je
opravdu co rozmýšlet. Orchestrátor volbu navrhne a nechá si ji potvrdit.

**Jiné optiky v review.** Bezpečnostní a výkonový reviewer tu nedávají smysl — appka nemá
backend, DB ani přihlášení, takže žádné N+1 ani multi-tenant izolace. Ty dva sloty zabírá
`react-state-reviewer` (efekty, cleanup, vlastnictví stavu — kde má tenhle repo doložený
dluh) a `device-ux-reviewer` (prohlížečová API na reálných telefonech — odkud pochází
většina skutečných vracaček: `;charset` v MIME, který Android odmítne, blob revokovaný
dřív než ho Safari stáhne, BOM v CSV). **A nepouštějí se všichni na každý diff** — skill
vybírá podle toho, čeho se změna dotkla.

**Ruční ověření na zařízení je součást dodávky**, ne bonus. Sekce „Ověřeno na" v každém
ticketu se vyplňuje pravdivě — včetně „neověřeno".

**Šestá optika jiným modelem** (`/kimi:review`) je tady **opt-in**. Na stořádkovou iteraci
je půlhodinový cross-model průchod dražší než užitečnější.

**Hosting je rozhodnutý** (GitHub Pages), takže guard nezakazuje push úplně — zakazuje
commit a push na `main`, protože ta se deployuje.

**Feature branch se pushuje a PR zakládá flow sama.** Fáze 3 pushne a otevře draft PR
hned, jak je co pushnout, fáze 5 do něj dopushuje review fixy a překlopí ho na ready.
Review se dělá **na GitHubu**, ne nad lokálním diffem. **Merge zůstává uživateli** —
merge do `main` je deploy.

## Guardraily

Hooky jsou **deterministické** — nejde je „upovídat". Proto guardrail vždycky raději
do hooku než do promptu.

`guard.mjs` blokuje: zápis do `.env`, `build/`, `node_modules/`, scratch artefakty
v pracovním stromě, **commit a push na `main`**, `git push --force` (bez `-with-lease`),
`--no-verify`, `git reset --hard`, a **editaci sebe sama** (model si nesmí přepsat vlastní
pojistky).

- Únikový východ (jen pro tebe z terminálu): `SENSEI_GUARD=off`.
- **Po každé změně hooku pusť `node .claude/hooks/tests/run.mjs`.** Hooky jsou jediná
  deterministická pojistka autonomního úseku — regrese v jednom regexu buď zablokuje
  všechnu práci, nebo tiše pustí push na `main`, což je rovnou deploy.

`format.mjs` pouští `eslint --fix` na právě změněný `.ts/.tsx/.js/.mjs`. Prettier tenhle
repo nemá; formátování drží `@stylistic` pravidla v `eslint.config.js`, takže eslint je
celý formátovací krok. Selhává tiše a nikdy neblokuje editaci.

> **V git worktree** hooky mlčí, dokud v něm neproběhne `yarn install` — `node_modules`
> je gitignorované, takže nový worktree ho nemá. Formátování se pak jen přeskočí
> (fail open), ale `yarn lint` a `yarn test` v něm neběží vůbec.
