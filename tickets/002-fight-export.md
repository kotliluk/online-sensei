---
id: 002
slug: fight-export
title: Export jednotlivého zápasu do CSV
status: review
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

### 2026-08-16 — po review

„- oprav sloupec na sekundy
- tlačítko stáhnout dej vedle tlačítka „Průběh zápasu"
- sloupce s výslednými hodnotami v CSV jasněji pojmenovat, třeba „Výsledné AKA body" apod.
- jinak za mě ok"

(Čtvrtý bod — potvrzovací dialog na „Zpět" — je samostatný ticket, protože s exportem
nesouvisí.)

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

- [ ] Tlačítko je vidět u samostatného i turnajového zápasu. **Po review přesunuto z řady
      se Start a Zpět vedle přepínače „Průběh zápasu"** — obě jsou ovládání toho, co se
      se zápasem stalo, a řada tlačítek zápasu se tím vrací na čtyři.
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
- [ ] Řada tlačítek zápasu zůstane čtyřprvková; export nepřidává pátou položku.

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

## D — Hotovo

**Co se udělalo:** Commity `3d135e0` (implementace) a druhý s opravami z review. Čistá
funkce `buildFightCsv` v `src/logic/fightLog/csv.ts`, páté tlačítko na časomíře, hlavičky
sloupců v obou jazycích. Sada je po review **145 testů** (ze 139), z toho 19 nad samotným
shaperem; browser sada 66 včetně tří nových nad skutečným stažením souboru.

**Odchylky od B/C:** žádné. Sloupce, jméno souboru i chybějící vítěz sedí na to, co bylo
schváleno na gatu.

**Gotchas:**

- **Třída `export-btn` sama o sobě nic nedělá.** Ve vzoru u skupinových stopek k ní patří
  pravidlo `width: auto; min-width` scopnuté pod jejich wrapper. Přenést jen třídu znamená
  mrtvý selektor a popisek zalomený na dva řádky — což natáhne celý flex řádek z 38 na
  60 px, protože `.buttons` má výchozí `align-items: stretch`. Našli to **tři revieweři
  nezávisle**.
- **Sdílený modulový `store` v testech prosakuje mezi `describe` bloky.** `setKumiteTimer`
  nemaže `tournamentName`, takže export test „procházel" na názvu turnaje, který si
  naaranžoval úplně jiný test o dva bloky výš. Testy obrazovky si musí stav nastavit samy.
- **Symetrická data v testu schovají prohozené rohy.** Dokud měly oba rohy nula faulů,
  záměna `redFouls`/`blueFouls` prošla celou sadou. Stav v testu musí být asymetrický.

**Ověřeno na:** **desktop Chrome** (Playwright, 66/66) a emulované viewporty 412×915,
412×730, 390×664, 375×667, 360×640 a na šířku. Skutečně stažený soubor přečten po bajtech:
bez BOM, CRLF, středník, jméno souboru jen ASCII. Ověřeno i to, že `navigator.share`
dostane `File` s typem přesně `text/csv`, že při `NotAllowedError` cesta spadne zpět na
stažení a při `AbortError` ne, a že mimo secure context popisek čitelně degraduje na
„Stáhnout CSV". Testy jsou ověřené mutacemi: 8 mutací, všech 8 zčervenalo.

**Na reálném telefonu neověřeno** — ani stažení, ani sdílení. To je u téhle funkce zrovna
ta část, kde se to v tomhle projektu čtyřikrát rozbilo, takže „zeleno" tady neznamená
hotovo. Co zkusit, je v uzávěrce.

## Review

Branch: `fight-export` · revieweři: všichni čtyři (`correctness`, `react-state`,
`device-ux`, `tests`), nad `git diff fight-log...HEAD`, aby znovu neprocházeli ticket 001.

**Opravit — vše opraveno**

- [major] `KumiteTimerScreen.tsx:383` + `KumiteTimerScreen.scss:56` · třída `export-btn`
  přenesená ze vzoru bez svého pravidla → popisek „Stáhnout CSV" i „Download CSV" se
  v pevných 8 rem láme na dva řádky a natáhne celý flex řádek z 38 na 60 px. **Našli
  nezávisle tři revieweři** (korektnost 85, react-state 90, device-ux 100); přiřazeno
  device-ux, který to změřil na 412, 375 i 360 px v obou jazycích. Ověřeno po opravě:
  jeden řádek, 133 px cs / 141 px en · **✅ opraveno**
- [major] dotyková větev tlačítka neměla test — mutace „popisek ignoruje `willShareFile`"
  i „ptá se na jiný MIME, než exportuje" procházely celou sadou. Přibyl test, který
  přepíše `matchMedia` na `(pointer: coarse)` a `navigator.canShare`, a **zároveň
  kontroluje, na jaký typ se `willShareFile` ptal** · **✅ opraveno**
- [major] sloupec turnaje se nikde neasertoval a jeho hodnota v testu **prosákla ze
  sdíleného modulového `store`** z jiného `describe` — mutace „název turnaje se do souboru
  nedostane" procházela. Export testy si teď turnaj zakládají samy, plus nový případ
  samostatného zápasu s prázdným sloupcem · **✅ opraveno**
- [major] nic nedokazovalo, že hlavičky jdou z překladu — `headerRow` přepsaná na anglické
  literály i změněný český překlad procházely. Přibyly tři testy nad `CS`, které navíc
  připínají, že `typ` a `strana` zůstávají napříč jazyky identické · **✅ opraveno**

**Opraveno nad rámec bucketu (80–89), a proč**

- [minor 88] fauly a senchu šlo na úrovni obrazovky prohodit i vymazat bez pádu testu —
  oba rohy měly v testech nula faulů. **Vyřešilo se samo** s přepracováním testu výš, kde
  stav musel být stejně asymetrický.
- [minor 85] „tlačítko je v řadě se Start a Zpět" nemělo test; přesun tlačítka pod
  `<FightLog />` procházel. Opraveno **ne jako review fix, ale jako uzávěrka**: je to
  akceptační kritérium bez jediného testu, a nenaplněné kritérium je podle flow blocker.

**Zvážit — nechal jsem na tobě**

- ✅ **odpadlo přesunem tlačítka.** Export už v řadě není, takže je zpátky na čtyřech
  a chová se jako před tímhle ticketem. Že se i ta čtyřka na 375 px láme na dva řádky
  a je nízko, zůstává — ale to je bod 4 v `TODO.md`, ne tenhle ticket. Původní nález:
  [major, jistota 95] **s pátým tlačítkem se řada na užších telefonech lámala na tři řádky
  a padala pod okraj.** Změřeno: 375×667 (iPhone SE/13 mini)
  a 360×640 → tři řádky, pod okrajem „Uložit zápas", „Stáhnout CSV" i „Zpět"; na šířku
  (667×375) je pod okrajem **celá řada včetně Start**. Na 412 px je všechno vidět, proto
  to v mém měření neprosáklo. Neopravuju: oprava je designové rozhodnutí (užší tlačítka
  pod nějakým breakpointem) a reviewer sám doporučuje nejdřív zkusit na zařízení. Souvisí
  s bodem 4 v `TODO.md`.
- ✅ **rozhodnuto a opraveno.** [minor 85] `csv.ts` · sloupec „Zbývá" byl `m:ss`
  a tabulkové procesory ho autokonvertují na hodiny:minuty — `0:05` (pět vteřin do konce)
  se v Sheets i Excelu zobrazí jako pět minut. Teď jsou to holé sekundy a hlavička to říká:
  „Zbývá (s)" / „Remaining (s)". Zároveň dostaly výsledkové sloupce jasnější jména
  („Výsledné AKA body" místo „AKA body"), aby se nepletly s tím, co se stalo v té chvíli.
- [minor 85] `KumiteTimerScreen.tsx:167` · **sdílecí sheet překryje běžící časomíru.**
  Export je jediné tlačítko v řadě, které není vypnuté během běhu zápasu — schválně, nic
  nemění. Jenže na telefonu `navigator.share()` vytáhne systémový sheet přes celou
  obrazovku a hodiny odečítají vteřinu **za tick `setInterval`u**, ne z reálného času
  (`pausableInterval.ts` sahá na `new Date()` jen v `pause()`). Co prohlížeč udělá
  s časovači schované stránky, se propíše rovnou do zápasového času. Chce to změřit na
  zařízení, ne hádat.

**Bez nálezů:** korektnost mimo ten jeden sdílený nález — ověřila počty a pořadí sloupců,
vyčerpávající `eventCells`, že export bere strany ze zápasu a ne ze zobrazení, a lokální
čas přes půlnoc.

**Ověření oprav:** 8 mutací spuštěno v kopii repa mimo pracovní strom, **všech 8
zčervenalo**.
