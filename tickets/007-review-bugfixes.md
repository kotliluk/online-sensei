---
id: 007
slug: review-bugfixes
title: Opravy chování z revize repa
status: wip
branch: review-bugfixes
---

# Opravy chování z revize repa

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19, deset read-only reviewerů nad `src/`).
Uživatel k dělení nálezů na tickety:

„dává smysl z toho dělat 3 tickety? nebude analýza ticketu delší než fix? co to rozdělit
tématicky na tickety: - bugfixy - UI/UX fixy - testy/konzistence/lint"

Tohle je ten první: **všechno, co mění chování a zavírá se testem.**

## B — Zadání

**Problém:** Sada je 246/246 zelená, a přesto appka na čtyřech cestách skončí bílou
stránkou a na dvou zapíše do turnaje výsledek, který se nestal. Všechno jsou preexistující
bugy a všechny přežily právě proto, že ty cesty netestuje nic.

**Rozsah:** Devět nálezů kategorie „pád nebo špatný výsledek" plus ty z kategorie „ztráta
dat", které jsou na jeden až pět řádků. Ke každému test — bez něj se to za měsíc vrátí.

**Mimo rozsah:**

- **Hodiny počítající tiky** (`PausableInterval`). Mění se, jak se v celé appce měří čas,
  sahá to na dva volající a ověřuje se to zamčeným telefonem. Vlastní ticket, normální dráha.
- **Guard na odchod z obrazovky** (logo v hlavičce obchází potvrzení z ticketu 003).
  Produktové rozhodnutí přes pět obrazovek. Vlastní ticket.
- UI, layout a texty → ticket 009.
- Testy nad turnajovým postupem → ticket 008. Tady se píšou jen testy k opraveným bugům.
- Mrtvý kód a duplicity → ticket 010.
- **Rozjet hodiny znovu po konci zápasu.** Při zpětné vazbě k tomuhle ticketu vyšlo najevo,
  že scénář „čas doběhl, rozhodčí ho vrátí o pár vteřin a pokračuje se" **dnes nefunguje**:
  na nule se `phase` přepne na `finished` a tlačítko Pauza/Pokračovat je
  `disabled={phase === 'init' || phase === 'finished'}` (`KumiteTimerScreen.tsx:376`),
  takže čas sice přidat jde, ale hodiny se už nerozjedou — jediné aktivní tlačítko je
  „Resetovat zápas", které smaže skóre. Opravy v tomhle ticketu to **nezhorší ani nespraví**.
  Je to samostatné rozhodnutí (má se `finished` opouštět automaticky, když se čas nastaví
  nad nulu? nebo má přibýt „Pokračovat" jako vědomá akce?) — čeká na uživatele.

**Akceptační kritéria:**

Pády:

- [ ] Intervalový časovač doběhne sérii a ukáže „Hotovo!" — dnes spadne na bílou stránku
      při **každém** doběhnutí (`intervals[currInterval].name` bez ochrany).
- [ ] Pauza 0 s posune sérii na další interval; čas nikdy nejde pod nulu. Dnes se odpočet
      zasekne a jede do minusu donekonečna.
- [ ] Pokročilá série, ze které `skipLastPause` sní jediný interval, nespustí prázdný
      seznam — buď se Start nepustí, nebo se poslední pauza nechá.
- [ ] Turnajová obrazovka bez rozjetého turnaje přesměruje na nastavení místo pádu
      (deep link, Zpět po zrušení turnaje, neplatný strom v `localStorage`).
- [ ] Poškozená hodnota v `localStorage` (useknutý JSON, jiný tvar dat, `'5'` místo pole)
      spadne na default a appka nastartuje. Dnes výjimka zabije bootstrap a jediná záchrana
      na telefonu je smazat data webu.

Špatné výsledky:

- [ ] Zápas 2:2 se senchu pro **ao** předvyplní v dialogu jako vítěze **AO**.
- [ ] Znovuotevřený a opravený skupinový zápas zapíše do zrcadlené buňky výsledek
      **s prohozenými stranami**. Dnes tam jde nepřehozený a oba závodníci skončí s prohrou.
- [ ] Repasážní zápas hlouběji než kořen linie si uloží výsledek, vítěze i log.
      Dnes zůstane `0:0` a `winner: undefined`, i když postupující se propíše.
- [ ] Uložený čas se zobrazí se správnými setinami: 12 340 ms jako `12.34`, ne `12.33`.

Ztráta dat a špatné chování:

- [ ] Reakce: Pauza a Reset během první čekací fáze nechají cvičení běžet dál. Dnes
      obrazovka zamrzne a Reset i Zpět jsou disabled.
- [ ] Vložení pěti jmen oddělených čárkou do soupisky se třemi řádky vyplní ty tři, které
      se vejdou. Dnes to neudělá nic — ani ta tři. (Platí pro stopky i kumite.)
- [ ] Odkaz na stopky s rozbitou barvou si nechá jména a spadne na defaultní barvu.
      Dnes zahodí celou soupisku.
- [ ] Editace jmen v kumite nastavení, kterou uživatel nepotvrdí, nezmění rozjetý turnaj.
- [ ] Zrcadlo otevřené **po** udělení senchu ho ukáže zaškrtnuté.
- [ ] Otevření druhé záložky na `/kumite-timer` bez session nepřepíše zrcadlo nulami.
- [ ] Houkačka konce, atoshibaraku i záznam „Konec" v logu vzniknou **z tiku hodin**, ne
      z ruční změny času. Vrácení času po konci zápasu tedy zůstává možné a samo o sobě nic
      nespustí; teprve když hodiny znovu doběhnou na nulu, zahouká to a zapíše se konec.
      Dnes stačí přidat sekundu a vrátit ji, aby se houkalo podruhé, a ruční sjetí na 0:15
      spustí atoshibaraku, i když čas neběží.
- [ ] „Sdílet" mimo secure context (http na lokální síti) ukáže hlášku `shareFailed`.
      Dnes synchronní `TypeError` mine `.catch` a tlačítko vypadá mrtvě.
- [ ] Fauly nejdou v zrcadle klikat a nemají `cursor: pointer` — stejně jako to už dělá
      `Score`.
- [ ] V produkčním kódu nezůstane `console.log`.

**Technicky** (malá dráha, `C` se nepíše — analýzu udělala revize):

Podklad s repro kroky, měřeními a `path:line` ke každé položce:
[report z revize](https://claude.ai/code/artifact/41b49176-0f80-4a4c-9c69-3a3796bb2d22).

| Oprava                                                           | Kde                                                                 | Velikost |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- | -------- |
| senchu `BLUE` → `setWinner('BLUE')`                              | `FightResultModal.tsx:45`                                           | 1 ř.     |
| Start hlídá i počet závodníků                                    | `kumiteTimer/setUpScreen/SetUpScreen.tsx:201`                       | 1 ř.     |
| předat `expectedType` do rekurze                                 | `types/tournament.ts:309–310`                                       | 2 ř.     |
| zachovat `uuid` cílové buňky                                     | `types/tournament.ts:170–186`                                       | 1–3 ř.   |
| index při renderu                                                | `IntervalTimerScreen.tsx:145`                                       | 1 ř.     |
| přechod na `currTime <= 0`                                       | `IntervalTimerScreen.tsx:77`                                        | ~5 ř.    |
| `arr.length > 0` do validátoru                                   | `redux/intervalTimer/utils.ts:27`                                   | ~5 ř.    |
| `<Navigate>` bez turnaje + `repechageTree` do `cancelTournament` | `TournamentScreen.tsx:124`                                          | ~10 ř.   |
| `try/catch` + `Array.isArray`                                    | `logic/localStorage/access.ts:93`, `validation/validators.ts:15`    | ~10 ř.   |
| setiny celočíselně z ms                                          | `utils/time.ts:132–136`                                             | 3 ř.     |
| restart časovače v `handleReset`                                 | `ReactionsScreen.tsx:63–67`                                         | 3–5 ř.   |
| stráž na délku pole, ne na `LIMITS.max`                          | `groupStopwatch/setUpScreen/SetUpScreen.tsx:80`, `kumiteTimer/…:65` | 1 ř. ×2  |
| fallback po polích u barev                                       | `logic/urlState/groupStopwatchUrl.ts:60–72`                         | ~5 ř.    |
| kopírovat položku, ne jen pole                                   | `kumiteTimer/setUpScreen/SetUpScreen.tsx:58–60`                     | 2–4 ř.   |
| `unquote` i na počáteční hodnotu                                 | `logic/hooks/useLSSyncConsumer.ts:9`                                | 2 ř.     |
| providery až za `isActual` guard                                 | `KumiteTimerScreen.tsx:62–70`                                       | ~10 ř.   |
| signály na tik hodin, `setIsPaused(true)` u nuly                 | `KumiteTimerScreen.tsx:285–295`                                     | ~10 ř.   |
| `navigator.clipboard?.` + hláška                                 | `common/shareButton/ShareButton.tsx:34–39`                          | 3–5 ř.   |
| `isMirror` do `Fouls`                                            | `Fouls.tsx`, `FighterStats.tsx`, `Fouls.scss`                       | ~8 ř.    |
| smazat `console.log`                                             | `TreeTournamentScreen.tsx:41`, `redux/intervalTimer/actions.ts:183` | 2 ř.     |

**Oprava setin — pozor na zjevnou variantu.** Chyba je na `const decimals = cur - seconds`,
odčítání ve floatu. Změřeno přes 600 000 hodnot: `Math.round((sec - seconds) * 100)` sedí
pro časy na celé setině, ale u libovolných milisekund se mýlí ve **44,7 %** — _zaokrouhluje_,
kdežto appka všude _ořezává_. To by nebyla oprava, ale změna chování. Funguje tohle
(0 neshod pro `withDecimals` 1, 2 i 3):

```ts
const totalMs = Math.round(sec * 1000);
const seconds = Math.floor(totalMs / 1000);
const toShow = Math.floor((totalMs % 1000) / Math.pow(10, 3 - withDecimals));
```

**Testy:** ke každému kritériu aspoň jeden. Čisté funkce (`tournament.ts`, `time.ts`,
`access.ts`, `groupStopwatchUrl.ts`) jednotkově; obrazovky přes Testing Library
s fake timers. `FightResultModal` má smysl otevřít vytažením `defaultWinner(fight, type)`
do čisté funkce a otestovat celou kaskádu přes `test.each` — dnes ten soubor neimportuje
žádný test, což je přesně důvod, proč tam ten bug je.

**Rozsah vs. malá dráha:** je to víc souborů, než malá dráha popisuje, ale každá položka je
oprava na jednotky řádků s hotovým repro. Kdyby některá začala růst — hlavně `TournamentScreen`
a signály na tik hodin —, **vyndat ji do vlastního ticketu**, ne ji dotlačit tady.

## Review

<!-- doplní /ticket-review -->
