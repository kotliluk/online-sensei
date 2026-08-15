---
id: 002
slug: fight-export
title: Export jednotlivého zápasu do CSV
status: wip
branch: fight-export
---

# Export jednotlivého zápasu do CSV

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-15

Druhá ze tří fází z původního zadání (první je [ticket 001](./001-fight-log.md)):

„2) export jednotlivého zápasu (nové tlačítko zobrazené ve „start" a „back") - stáhne
aktuální stav + logy jako CSV asi

- můžeme pak na dev serveru iterovat nad tím jakou strukturu souboru budeme stahovat"

Rozhodnutí ke struktuře souboru, na dotaz při analýze ticketu 001 (nabízel jsem plochý
tvar — řádek na událost, metadata v úvodních sloupcích — proti čitelnějšímu bloku
klíč-hodnota plus tabulce; plochý proto, aby fáze 3 byla konkatenace, ne nový formát):

„3. souhlasím"

A později: „pak pokračuj exportem zápasu"

## B — Zadání

**Problém:** Průběh zápasu je od ticketu 001 zaznamenaný, ale nedá se dostat z telefonu
ven — přežije jen do zavření záložky (u samostatného zápasu) nebo do zrušení turnaje.
Kdo chce zápas rozebrat po soustředění nebo doložit sporný výsledek, nemá co otevřít.

**Rozsah:**

- Nové tlačítko v řadě se Start a Zpět na obrazovce časomíry, u samostatného
  i turnajového zápasu.
- Stáhne (nebo na dotykovém zařízení nabídne sdílet) CSV se stavem zápasu a jeho logem.
- **Plochý tvar: řádek na událost, metadata zápasu v úvodních sloupcích.** Ne proto, že je
  hezčí, ale aby fáze 3 byla konkatenace, ne nový formát.
- Konkrétní sloupce se doladí na dev serveru — zadání fixuje tvar, ne jejich seznam.

**Mimo rozsah:**

- Export celého turnaje (fáze 3) — vlastní ticket, ale tenhle formát mu musí sednout.
- XLSX. Zvážené a zamítnuté u skupinových stopek; důvody v `TODO.md`, oddíl
  „What was measured about the CSV export".
- Změny samotného logu nebo panelu — to je hotové v ticketu 001.

**Akceptační kritéria:**

- [ ] Tlačítko je v řadě se Start a Zpět a je vidět u samostatného i turnajového zápasu.
- [ ] Na dotykovém zařízení říká „Sdílet CSV" a otevře systémové sdílení; jinde říká
      „Stáhnout CSV" a soubor stáhne. (Stejné rozhodování jako u skupinových stopek.)
- [ ] Soubor má hlavičkový řádek a pak jeden řádek na každou položku logu, v pořadí,
      v jakém jsou v panelu.
- [ ] Každý řádek nese metadata zápasu (jména rohů, výsledné skóre, fauly, senchu,
      název turnaje u turnajového zápasu) — takže řádek dává smysl sám o sobě.
- [ ] Zápas s prázdným logem se exportovat dá; soubor má hlavičku a jeden řádek se
      stavem a prázdnými sloupci události.
- [ ] Jméno se středníkem nebo uvozovkou soubor nerozbije.
- [ ] Soubor je UTF-8 bez BOM, oddělovač středník, MIME `text/csv` — stejně jako
      u skupinových stopek, kde to bylo změřené na telefonu.
- [ ] Popisek tlačítka je v `cs.ts` i `en.ts`.
- [ ] Řada tlačítek se s pátým tlačítkem na telefonu nerozpadne (zalomení opravené
      v ticketu 001).

**Poznámka k uloženému stavu:** tenhle ticket **nemění tvar ničeho v `localStorage`** —
log tam ukládá už 001. Migrace se netýká.

**Otevřené otázky** (na analýzu, ne blokující):

- Přesný seznam sloupců a jejich pořadí — to je právě to, co se má iterovat.
- Jak se má jmenovat soubor u turnajového zápasu (jména závodníků mají diakritiku
  a mezery).
- Jestli má být v souboru i strojově čitelná podoba události (typ, strana, hodnota)
  vedle lidského popisu, nebo stačí popis.

## C — Analýza

**Reuse / gap:**

| Dílčí věc                       | Stav          | Kde to žije / co reusnu                                                                           |
| ------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| Skládání CSV                    | ✅ existuje   | `buildCsv` `src/utils/csv.ts:41` — středník, CRLF, uvozování                                      |
| Kódování a MIME                 | ✅ rozhodnuto | `CSV_MIME_TYPE` `src/utils/csv.ts:39` — bez BOM, holé `text/csv`                                  |
| Stažení vs. sdílení             | ✅ existuje   | `exportFile` / `willShareFile` `src/logic/download/exportFile.ts:67,47`                           |
| Popisek tlačítka                | ✅ existuje   | `ct.downloadCsv` / `ct.shareCsv` (`cs.ts:29`, `en.ts:29`)                                         |
| Celý vzor tlačítka              | ✅ existuje   | `Results.tsx:46,82,88` — `useState(() => willShareFile(...))`, handler, `new File(...)`           |
| Popis události textem           | ✅ existuje   | `formatFightEvent` `src/logic/fightLog/format.ts:23`                                              |
| Formát času zápasu              | ✅ existuje   | `parseTime` `src/utils/time.ts:23`                                                                |
| Skládání řádků exportu          | ❌ chybí      | nový `src/logic/fightLog/csv.ts`                                                                  |
| Zdroj dat u samostatného zápasu | ⚠️ pozor      | entita `Fight` **neexistuje**, stav je v lokálním state obrazovky (`KumiteTimerScreen.tsx:53,73`) |

**Kam to přijde:**

- `src/logic/fightLog/csv.ts` — nový, vedle `format.ts`. Čistá funkce, žádný React.
- `src/logic/fightLog/tests/csv.test.ts` — nový.
- `src/components/kumiteTimer/kumiteTimerScreen/KumiteTimerScreen.tsx` — páté tlačítko
  a handler.
- `src/components/kumiteTimer/kumiteTimerScreen/tests/KumiteTimerScreen.test.tsx` —
  rozšíření.
- `cs.ts` / `en.ts` — hlavičky sloupců (popisek tlačítka už existuje).

**Postup:**

Vzor je **export výsledků skupinových stopek** (`Results.tsx:82-89`): handler poskládá
`string[][]`, prožene `buildCsv`, zabalí do `File` a předá `exportFile`. Popisek tlačítka
se rozhodne jednou při mountu přes `willShareFile`, ne při každém renderu — protože závisí
na zařízení, ne na datech. Přebírám to beze změny.

Vstupem shaperu je **strukturální podmnožina `Fight`**, ne `Fight` sám a ne nezávislý typ:

```ts
type ExportedFight = Pick<Fight, 'redPoints' | 'redFouls' | 'bluePoints' | 'blueFouls' | 'senchu'>
  & { tournamentName?: string, redName?: string, blueName?: string, log: FightLogEntry[] }
```

Samostatný zápas entitu `Fight` nemá, takže obrazovka záznam poskládá z lokálního stavu;
turnajový zápas ho splňuje přímo, takže **fáze 3 nemapuje nic** kromě `log ?? []`.

Proč ne rovnou `Fight`: `newFight()` volá `uuidV4()`, takže by testy shaperu potřebovaly
mock uuid, který kvůli témuž nese `src/types/tests/tournament.test.ts:5`; signatura by
tvrdila, že potřebuje 15 polí, zatímco čte 8; a `redName` je na `Fight` povinný `string`,
takže by samostatný zápas musel poslat `''` — lež, kterou by shaper stejně musel
odhalovat. Nepovinné pole to řekne rovnou.

Popis události **musí jít přes `formatFightEvent`**, ne přes vlastní `switch`. Ten má
vyčerpávající `switch` bez `default`, takže nový druh události shodí překlad — a to je
přesně ta pojistka, která v ticketu 001 chyběla u `FightResult` a stálo to tichou ztrátu
dat (viz „Gotchas" v [001](./001-fight-log.md)). Druhý ručně psaný `switch` by tu pojistku
zrušil.

**Navrhovaný tvar souboru** (výchozí bod k iteraci, ne finální):

```
turnaj; aka; ao; čas; zbývá; typ; strana; hodnota; popis; body aka; fauly aka; body ao; fauly ao; senchu
```

- **identita → událost → výsledek.** Kdo a kdy vlevo, co se stalo uprostřed, jak to
  dopadlo vpravo. Pro fázi 3 je podstatné, že je sada sloupců stejná, ne jejich pořadí.
- `typ` je surový klíč události (`POINTS`, `TIME_SET`, …) — nepřekládá se, aby šlo podle
  něj filtrovat napříč jazyky. `popis` je tatáž událost větou v jazyce UI.
- `hodnota`: u `POINTS` znaménková delta, u `FOULS` / `SENCHU` / `TIME_SET` výsledná
  hodnota, jinak prázdno. `strana` se plní jen u `POINTS` a `FOULS`; u senchu drží nového
  držitele `hodnota`. Výchozí stav (`from`) nese jen `popis`.
- `čas` je lokální `RRRR-MM-DD HH:MM:SS` z `entry.at`, `zbývá` je `parseTime(fightTime)`.
- Hlavičky v jazyce UI, stejně jako u skupinových stopek.

**Plán testů:**

- [ ] `buildFightCsv` — hlavička plus řádek na položku, v pořadí logu.
- [ ] Metadata se opakují na každém řádku a odpovídají předanému stavu.
- [ ] Prázdný log → hlavička a jeden řádek se stavem a prázdnými sloupci události.
- [ ] `POINTS` dá znaménkovou deltu, `FOULS`/`SENCHU`/`TIME_SET` výslednou hodnotu,
      `START`/`PAUSE` prázdnou `hodnota` i `strana`.
- [ ] Jméno se středníkem a s uvozovkou projde uvozováním `buildCsv` (`Novák; Jan`).
- [ ] Samostatný zápas (bez turnaje a jmen) vyrobí platný soubor s prázdnými sloupci.
- [ ] Obrazovka: tlačítko je v řadě a jeho popisek se řídí `willShareFile`.
- [ ] Obrazovka: kliknutí vyrobí `File` s typem `text/csv` a jménem podle vzoru
      (přes stub `exportFile`, ne skutečné stažení).

**Rizika a zařízení:** **týká se, a hodně.** Tohle je druhá funkce v appce, která sahá na
`navigator.share` a bloby — všechno, co bylo naměřeno u skupinových stopek, platí:
`canShare()` není příslib, že `share()` projde; MIME s parametrem Android odmítne; blob se
nesmí revokovat hned kvůli Safari na iOS. To všechno drží `exportFile`, takže se to
**nesmí obcházet vlastní cestou ke stažení**. Nové riziko: soubor nese **jména závodníků
na každém řádku**, takže rozbité čtení lokálního CSV v Google Sheets na Androidu bude
vidět víc než u stopek. Není to důvod měnit formát — soubor je v pořádku, rozbitá je ta
aplikace. Ruční ověření na telefonu je součástí dodávky.

**Předpoklady:**

- Jméno souboru `kumite-RRRR-MM-DD-HHMM.csv` podle vzoru skupinových stopek; jména
  závodníků do názvu nedávám (diakritika a mezery), jsou uvnitř souboru.
- Exportuje se **stav na obrazovce**, ne uložený výsledek — tlačítko je na časomíře, tedy
  před uložením do turnaje. Vítěz se proto v souboru neobjeví, ten vzniká až v modálu.
- Tlačítko je vždy povolené, i za běhu hodin. Export nic nemění, takže nepatří mezi
  „nebezpečná" tlačítka blokovaná `dangerousButtonsDisabled`.
- Zápas s prázdným logem se exportovat dá (kritérium z `B`), tlačítko se neschovává.

**Rozhodnuto na gatu (2026-08-15):**

1. **Sloupce a pořadí schváleny** tak, jak jsou navržené výš. Zůstávají výchozím bodem
   k doladění na dev serveru.
2. **Vítěz v souboru zatím nebude.** Do budoucna se ale má volba vítěze přesunout jinam,
   aby šla započítat do logu — včetně podrobností k *hantei*. Zapsáno do backlogu
   (`TODO.md`, „Product backlog"), tenhle ticket se toho nedotýká.
3. **`hodnota` u `TIME_SET` v sekundách.** `popis` nese čitelné `2:00 → 1:22`.

**Otevřené otázky:** žádné — gate uzavřen.
