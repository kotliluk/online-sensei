---
id: 007
slug: review-bugfixes
title: Opravy chování z revize repa
status: done
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

Branch: `review-bugfixes` · revieweři: `correctness`, `react-state`, `device-ux`, `tests` —
všechny čtyři, protože diff sahá na logiku, na hooky a efekty, na prohlížečová API i na SCSS
a přidává přes sto testů.

**Opravit (90–100)**

- [major] `KumiteTimerScreen.tsx:131` · `handleTick` porovnával `next === 0`, takže hodiny
  rozjeté z ručně nastavené nuly proletěly koncem a běžely do záporu (`-1:59`, …); ven vedl
  jen Reset, který smaže skóre. Regrese zavedená přesunem signálů na tik → `Math.max(0, …)`
  · **✅ opraveno** (commit `6429c70`, dva testy; bez clampu červenají)
- [major] `KumiteTimerScreen.tsx:127` · `PausableInterval.resume()` po prvním tiku
  bezpodmínečně nasadí interval znovu, takže `clock.pause()` volaný **uvnitř** tiku se
  vzápětí zruší. Zápas doběhlý na tiku po „Pokračovat" zahoukal dvakrát a zapsal dva
  „Konec" → stráž na `phaseRef.current === 'finished'` · **✅ opraveno** (dva testy).
  Kořen je v `PausableInterval` a patří ticketu 011; tohle je úzká verze.
- [minor] `KumiteTimerScreen.tsx:136` · tabulka v tomhle ticketu slibuje `setIsPaused(true)`
  u nuly, kód to nedělal · **✅ opraveno**
- [major] `Fouls.tsx` · kritérium 18 nemělo test žádný — obě mutace (vrátit `onClick`,
  smazat `__mirror`) prošly celou sadou → nový `fouls/tests/Fouls.test.tsx`
  · **✅ opraveno**, obě mutace teď červenají
- [major] `ShareButton.test.tsx:55,74` · asserty byly jen `toBeTruthy()`, takže testy
  „zkopírováno" a „nepodařilo se" byly navzájem zaměnitelné a tři mutace hlášky prošly
  → asertuje se konkrétní text · **✅ opraveno**
- [major] `groupStopwatch/setUpScreen/SetUpScreen.tsx:82` · vkládání jmen přes čárku nemělo
  ve stopkách test vůbec, přitom právě tady stará mez reálně **hází** (zápis je mutable,
  na rozdíl od kumite) → dva testy · **✅ opraveno**, návrat staré meze červená
- [major] `KumiteTimerScreen.tsx:63` · kritérium 15 mělo jen negativní směr — že karta
  **se** session psát musí, nehlídalo nic, takže „na projektoru zamrzlo 0:0" by sada
  propustila → test na pozitivní směr · **✅ opraveno**
- [major] `TournamentScreen.tsx:127` · netestovaná větev `tournamentType === 'TREE' && tree
  === null` a neasertovaný cíl přesměrování → dva testy · **✅ opraveno**, obě mutace
  (zúžit stráž, přesměrovat jinam) červenají
- [minor] `TournamentScreen.test.tsx:225` · assert na repasáž prošel i po smazání
  `repechageTree` z reduceru — strom repasáže ve storu nikdy nebyl, arrange psal jen do
  `localStorage` → arrange ho tam teď dá · **✅ opraveno**
- [minor] `FightResultModal.tsx:34` · napojení `defaultWinner` na dialog netestované
  (`setWinner('RED')` prošlo celou sadou) → `FightResultModal.test.tsx`
  · **✅ opraveno** — jistota byla 88, ale test je levný a zavírá akceptační kritérium
- [minor] `IntervalTimerScreen.scss` · prázdný `<h1>` na konci série sebere ~38 px a řádek
  tlačítek skočí nahoru přesně v tom renderu, kdy se odemkne → `min-height: 1em`
  · **✅ opraveno** — jistota 85, ale je to layout na řádku, který přidal tenhle ticket

**Zvážit (80–89) — nechal jsem na tobě**

- `types/tournament.ts:203` · **skupinová tabulka rozehraná před touhle opravou zůstane
  poškozená.** Stará verze při prvním uložení zapsala zrcadlené buňce cizí `uuid` a to je
  v `localStorage`; oprava brání vzniku, ne tomu, co už je uložené. Pro turnaj rozjetý před
  updatem tedy kritérium „znovuotevřený zápas se zrcadlí" **neplatí**. Léčba (přerazit
  identity při načtení, nebo brát jako ten zápas jen první shodu a každou další za zrcadlo)
  je vlastní ticket.
- `KumiteTimerScreen.tsx:127` · tik čte `timeRef`, který se plní až v pasivním efektu. Při
  tikách blíž než jeden render (throttling `setInterval` na pozadí) by se ztratila sekunda.
  Po clampu už to nemůže minout nulu, takže to není chyba, jen ostrá hrana → patří
  k ticketu 011 o hodinách.
- `Fouls.tsx:26` · kolečka faulů jsou `<div onClick>` bez `role`, `tabIndex` a jmenovky —
  Tab je přeskočí, klávesnicí faul udělit nejde, čtečka o nich mlčí. Preexistující
  → dopsáno do **ticketu 009**.
- `Fouls.scss:12` · na 360px displeji vyjdou kolečka ~32×36 px s mezerou 3,6 px, tedy pod
  44 pt i pod 48 dp, a pátý faul mění vítěze. Spočteno z CSS, neměřeno v prohlížeči.
  Preexistující → dopsáno do **ticketu 009**.

**Bez nálezů:** žádná optika neodešla prázdná. `device-ux` navíc ověřil, že `shareFailed`
je v `cs.ts` i `en.ts`, že `<Navigate>` sedí na `basename='/online-sensei'`, a že jediný
nový řádek SCSS nesahá na nic, co by Safari 14 neznalo.

## D — Hotovo

**Co se změnilo.** Devatenáct akceptačních kritérií, ke každému reprodukční test, který
jsem **nejdřív viděl zčervenat**. K tomu dvě regrese, které si tenhle ticket vyrobil sám
(hodiny z ručně nastavené nuly a dvojitá houkačka po „Pokračovat") — obě našlo review, obě
mají test.

**Akceptační kritéria**

| # | Kritérium | Stav | Čím |
| - | --------- | ---- | ---- |
| 1 | Intervalový časovač doběhne sérii | ✅ | `IntervalTimerScreen.tsx:145` · `intervalTimerScreen/tests/` |
| 2 | Pauza 0 s posune sérii, čas nejde pod nulu | ✅ | `IntervalTimerScreen.tsx:68` · tamtéž |
| 3 | `skipLastPause` nesní jediný interval | ✅ | `redux/intervalTimer/actions.ts:131` · `redux/intervalTimer/tests/actions.test.ts` |
| 4 | Turnajová obrazovka bez turnaje přesměruje | ✅ | `TournamentScreen.tsx:127` · `tournamentScreen/tests/` (obě větve + cíl) |
| 5 | Poškozený `localStorage` spadne na default | ✅ | `logic/localStorage/access.ts:93`, `validation/validators.ts:15` · `logic/localStorage/tests/` |
| 6 | Senchu pro ao předvyplní AO | ✅ | `defaultWinner` v `types/tournament.ts:176` · `types/tests/` + `FightResultModal.test.tsx` |
| 7 | Znovuotevřený skupinový zápas se zrcadlí | ✅ **s výhradou** | `types/tournament.ts:170` · `types/tests/`. **Neplatí pro turnaj rozjetý před updatem** — viz „Zvážit". |
| 8 | Repasáž hlouběji než kořen linie se uloží | ✅ | `types/tournament.ts:349` · `types/tests/` |
| 9 | Setiny: 12 340 ms → `12.34` | ✅ | `utils/time.ts:132` · `utils/tests/time.test.ts` |
| 10 | Reakce: Pauza + Reset v prvním čekání | ✅ | `ReactionsScreen.tsx:63` · `reactionsScreen/tests/` |
| 11 | Vložení jmen přes čárku vyplní, co se vejde | ✅ | oba `SetUpScreen.tsx` · testy v obou |
| 12 | Rozbitá barva v odkazu nezahodí soupisku | ✅ | `logic/urlState/groupStopwatchUrl.ts:60` · `logic/urlState/tests/` |
| 13 | Nepotvrzená editace jmen nezmění turnaj | ✅ | `kumiteTimer/setUpScreen/SetUpScreen.tsx:58` · `setUpScreen/tests/` |
| 14 | Zrcadlo po senchu ho ukáže | ✅ | `logic/hooks/useLSSyncConsumer.ts:9` · `logic/hooks/tests/` |
| 15 | Druhá záložka nepřepíše zrcadlo nulami | ✅ | `KumiteTimerScreen.tsx:63` · oba směry v `kumiteTimerScreen/tests/` |
| 16 | Signály vznikají z tiku hodin | ✅ | `KumiteTimerScreen.tsx:127` · `KumiteTimerSignals.test.tsx` (9 testů) |
| 17 | Sdílet mimo secure context ukáže `shareFailed` | ✅ **jen v jsdom** | `ShareButton.tsx:40` · `shareButton/tests/`. Že to na http z lokální sítě opravdu projde, test neříká — patří to do ruční zkoušky níž. |
| 18 | Fauly v zrcadle nejdou klikat | ✅ | `Fouls.tsx:31`, `Fouls.scss:26` · `fouls/tests/`. `cursor` samotný jsdom nepotvrdí. |
| 19 | Žádný `console.log` v produkčním kódu | ✅ | grep: v `src/` zbyl jen `console.error` ve dvou `.catch` v `logic/audio/player.ts` |

Nesplněné: žádné. Vědomě odložené: nic z těch devatenácti; co se do nich nedostalo, je
v „Mimo rozsah" a v ticketech 009–013.

**Odchylky od zadání**

- **Dvousekundové okno na přepsání času ve skupinových stopkách se nezměnilo.** Revize
  navrhovala kotvit ho k uloženému času místo k poslednímu ťuknutí. Zkusil jsem to a
  **rozbilo to funkci**: po dvou sekundách od uložení už nešlo čas opravit vůbec, což je
  přesně to, k čemu okno je. Chytil to až třetí test, který jsem si k tomu napsal. Produkční
  kód jsem vrátil, testy nechal — dokumentují i to riziko, že dva omylné doteky do dvou
  sekund čas přepíšou. Zúžit okno nebo dát nabité kartě viditelnou zpětnou vazbu je
  produktové rozhodnutí.
- **Tabulka „Technicky" slibovala `setIsPaused(true)` u nuly** a implementace to zprvu
  neudělala. Doplněno po review.

**Gotchas pro příště**

- **Přesun rozhodnutí z efektu na callback časovače otevírá cesty, které efekt zavíral.**
  Efekt nad hodnotou reaguje, ať se ta hodnota vezme odkudkoli; callback reaguje jen na
  vlastní tik. Obě regrese v tomhle ticketu jsou tenhle jeden vzorec.
- **`PausableInterval.resume()` vzkřísí hodiny, které si callback sám pauzl** — `setTimeout`
  volá callback a hned za ním `restart()`. Kdo pauzuje uvnitř tiku, musí počítat s tím, že
  o sekundu později přijde ještě jeden.
- **Přechod mezi intervaly se rozhoduje v efektu, takže se posune až po renderu.** Test,
  který posune fake timers o několik sekund v jednom `act()`, přeskočí **všechny** přechody.
  Tikat se musí po jednom, každý ve vlastním `act()`.
- **Mutace prošlá celou sadou nemusí být díra v testech.** Přepnutí defaultu
  `enabled = true` → `false` v `useLSSyncProvider` přežilo, protože všech devět volajících
  parametr předává explicitně — ekvivalentní mutant. Skutečná díra byla vedle: chyběl
  pozitivní směr.

**Ověřeno na**

- **Testy:** 363 v 28 souborech (main má 246 v 18), typecheck čistý, lint 63 warningů
  a 0 chyb (main 65 — o dva míň, žádný nový).
- **Mutačně:** každá oprava má test, u kterého jsem viděl červenou. U jedenácti nálezů
  z review jsem mutaci pustil znovu po opravě v pracovním stromu a vrátil ji zpátky.
- **V prohlížeči:** uživatel si opravy prošel lokálně na dev serveru (2026-08-25).
- **Na telefonu neproběhlo** a u tří věcí by mělo:
  1. **Sdílet přes obyčejné http** (`yarn dev --host`, otevřít z telefonu přes
     `http://<IP>:5173/online-sensei/`) — má se objevit hláška, ne mrtvé tlačítko. jsdom
     o tom neříká nic, mock je jen zopakovaný předpoklad.
  2. **Zrcadlo na telefonu nebo tabletu** — ťuknout na kolečko faulu, nemá se stát nic.
  3. **Konec pokročilé série s pojmenovanými intervaly** — sledovat řádek tlačítek
     v okamžiku, kdy naskočí „Hotovo!"; nemá poskočit.
