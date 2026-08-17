---
id: 006
slug: group-stopwatch-upgrades
title: Vylepšení skupinových stopek
status: approved # idea | spec | analysis | approved | wip | review | done | dropped
branch: group-stopwatch-upgrades
---

# Vylepšení skupinových stopek

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-17

Postřehy z ostrého používání skupinových stopek:

- tlačítko +/- (o 1 vteřinu) u jednotlivých uložených časů
- nahoře info počet dobehlych/celkových účastníků
- tlačítko smazání účastníka v nastavení
- vynulování času na podržení účastníka (pravé myšítko?)

## B — Zadání

**Problém:** Čtyři drobnosti, které chybí pokaždé, když se stopky používají naostro.
Špatně uložený čas jde opravit jen dvojklikem do dvou sekund — potom už nijak, a časoměřič
si toho většinou všimne až ve výsledcích. Není vidět, na koho se ještě čeká. A závodníka,
který nedorazil, jde v nastavení jen přepsat, ne odebrat.

**Rozsah:**

- **±1 s u uloženého času.** Na kartě závodníka, který už doběhl, dvě malá tlačítka.
  Posouvají jeho uložený čas, ne běžící stopky.
- **Počítadlo doběhlých.** U velkého času holé `3 / 8` — kolik závodníků má uložený čas
  z kolika. Bez popisku: samá čísla, takže nepřibývá text do obou překladů a nahoře je
  málo místa.
- **Smazání závodníka v nastavení.** Křížek u řádku závodníka, stejný jako u intervalů
  v pokročilém nastavení intervalových stopek (`SetUpAdvancedInterval.tsx:144`).
- **Vynulování času podržením.** Podržení karty **600 ms** smaže její uložený čas a vrátí
  ji do stavu „ještě neběžel". Myší i prstem stejně — na desktopu se podrží stejně jako
  na telefonu.

**Mimo rozsah:**

- Dvojklik do 2 s zůstává, jak je. Podržení je druhá cesta k opravě, ne náhrada.
- Vynulování pravým tlačítkem myši. V nápadu bylo s otazníkem, rozhodnuto proti: podržením
  se to dá na desktopu udělat taky, takže zůstává jediné chování a nikdo nemusí potlačovat
  kontextové menu.
- Ruční zadání času z klávesnice.
- Přidání závodníka jinak než zvýšením jejich počtu — to už jde.
- Odebrání závodníka z rozjetého měření. Mazat jde v nastavení, tedy před startem.
- Ukládání rozjetého měření. Časy dál žijí jen v komponentě a odchod z obrazovky je
  zahodí; tenhle ticket na tom nic nemění.

**Akceptační kritéria:**

- [ ] Karta bez uloženého času tlačítka ±1 s nemá; jakmile se čas uloží, objeví se.
- [ ] `+1 s` u závodníka s časem 12,34 s udělá 13,34 s — a nezmění čas nikoho jiného ani
      běžící stopky.
- [ ] `−1 s` u času pod jednu sekundu dá 0,00 s, ne záporný čas.
- [ ] Klik na ± se nepočítá jako klik na kartu: neuloží ani nepřepíše čas aktuálním.
- [ ] Po startu ukazuje počítadlo `0 / 8`, po uložení prvního času `1 / 8`.
- [ ] Vynulování času i reset stopek vrátí počítadlo o daný počet zpět.
- [ ] Křížek u druhého ze tří závodníků: zbudou dva, třetí se posune na druhou pozici
      a počet závodníků je 2.
- [ ] Při dvou závodnících (`LIMITS.competitorsCount.min`) je křížek disabled.
- [ ] Smazání závodníka je editace jako každá jiná — odkaz s nastavením v URL zmizí.
- [ ] Podržení karty s uloženým časem po dobu 600 ms čas smaže a po puštění se **neuloží
      znovu**.
- [ ] Stisk kratší než 600 ms čas nemaže — uloží ho, jako se ukládá dnes.
- [ ] Podržení karty bez uloženého času neudělá nic.
- [ ] Krátký klik dělá pořád to co dnes: uloží čas, druhý do 2 s ho přepíše.

## C — Analýza

**Reuse / gap:**

| Dílčí věc                                              | Stav        | Kde to žije / co reusnu                                                                                                         |
| ------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Mazání řádku ze seznamu v nastavení                    | ✅ existuje | `SetUpScreenAdvanced.tsx:87` (`splice` + `disabled` na minimu) a `SetUpAdvancedInterval.tsx:144` (`<Button><Cross /></Button>`) |
| Čistá funkce nad entitou v `types/`                    | ✅ existuje | `groupRowStats` v `types/tournament.ts` — vzor z ticketu 004, sem patří posun a smazání času                                    |
| Přepočet `timeString` po změně času                    | ✅ existuje | `recomputeCompetitorTimeStrings` (`GroupStopwatchScreen.tsx:65`) a `parseMinTime(…, 2, actualLeadingTimeUnit)`                  |
| Odvozený počet místo dalšího stavu                     | ✅ existuje | ticket 004 nahradil pět `useState` v `GroupTableRow` čistou funkcí; počítadlo je jednořádkový `filter` při renderu              |
| Ref s id časovače v handleru                           | ✅ existuje | `ShareButton.tsx:22,31` — přesně tvar, který potřebuje podržení                                                                 |
| Vlastní hook v `logic/hooks/` + test přes `renderHook` | ✅ existuje | `useValidatedState.ts`, `tests/useControledState.test.ts`                                                                       |
| Detekce podržení                                       | ❌ chybí    | v repu **není jediný** `onPointerDown`, `onContextMenu` ani nic podobného — jediná doopravdy nová věc v ticketu                 |
| Předání eventu z `Button`                              | ❌ nejde    | `Button.tsx:7` má `onClick?: () => void` **bez eventu**, takže `stopPropagation` z něj zavolat nejde (řešení níž)               |
| Testy skupinových stopek                               | ❌ chybí    | obě obrazovky jsou zatím netestované; testovací vzor bere `KumiteTimerScreen.test.tsx`                                          |

**Kam to přijde:**

- `src/types/groupStopwatch.ts` — `shiftCompetitorTime` a `clearCompetitorTime` vedle
  `newCompetitor` (`:33`).
- `src/logic/hooks/useLongPress.ts` — nový hook.
- `src/components/groupStopwatch/groupStopwatchScreen/GroupStopwatchScreen.tsx` +
  `.scss` — počítadlo, tlačítka ±, podržení.
- `src/components/groupStopwatch/setUpScreen/SetUpScreen.tsx` + `.scss` — křížek.
- Testy: `types/tests/groupStopwatch.test.ts`, `logic/hooks/tests/useLongPress.test.ts`
  a nové `tests/` u obou obrazovek.
- **`cs.ts` ani `en.ts` se nemění** — `+1 s`, `−1 s`, `3 / 8` a křížek jsou symboly
  a čísla. Je to vědomé, ne opomenutí; `Button` navíc `aria-label` neumí a mazací
  tlačítko u intervalů ho taky nemá.

**Postup:**

1. **Čisté funkce první.** `shiftCompetitorTime(competitor, deltaMs, leadingUnit)` vrátí
   nového závodníka s posunutým časem, ořízlým zdola na nule, a s `timeString`
   přepočteným `parseMinTime`em; závodníka bez času vrátí beze změny.
   `clearCompetitorTime` je tatáž věc pro `time: null`. **Použije ji i `handleReset`**
   (`GroupStopwatchScreen.tsx:109`), kde je dnes natvrdo `'--.--'` — což je po překročení
   minuty jiný placeholder, než jaký ukazuje zbytek obrazovky.
2. **Počítadlo** je `competitors.filter((c) => c.time !== null).length` spočtený při
   renderu, vedle velkého času (`:157`). Žádný nový stav, žádný efekt.
3. **`useLongPress(onPress, onLongPress, ms)`** vrátí sadu `onPointerDown/Up/Leave/Cancel/Move`
   a **vlastní obě větve** — krátký stisk i dlouhý. Tím z karty mizí `onClick` úplně
   a nevzniká klasická past „podržení smazalo čas a následný klik ho hned uložil zpátky":
   hook si drží ref s id časovače a ref „už vystřelilo" (vzor `ShareButton.tsx:31`)
   a na `pointerup` pošle klik jen tehdy, když dlouhý stisk nevystřelil. Dlouhý stisk
   střílí **v 600 ms**, ne až při puštění, aby bylo hned vidět, že se něco stalo.
   Zrušení: `pointercancel`, odjetí z prvku a **pohyb nad ~10 px** — seznam karet
   scrolluje (`GroupStopwatchScreen.scss`, `overflow-y: auto`) a stažení prstem po kartě
   nesmí smazat čas.
4. **Tlačítka ±** jsou dvě `Button` v `<div>`, který zastaví `onClick` i `onPointerDown`.
   Musí to být obalový div, protože `Button` event do `onClick` nepředává a měnit kvůli
   tomu sdílený atom není v rozsahu. Renderují se jen na kartě s uloženým časem.
5. **Křížek v nastavení** kopíruje intervalový vzor chováním, ne třídou: `splice` nad
   `competitors` + `setCompetitorsCount(validCompetitorsCount - 1)`, `disabled` při
   `validCompetitorsCount <= LIMITS.competitorsCount.min` (`utils.ts:10`, tedy 2).
   Efekt na `SetUpScreen.tsx:55` pole jen zvětšuje, takže smazání nerozbije. Vlastní
   pravidlo do `SetUpScreen.scss` — viz Rizika.

**Plán testů:**

- [ ] `shiftCompetitorTime`: 12 500 ms `+1 s` → 13 500 ms a `13.50`; jiný závodník beze změny.
- [ ] `shiftCompetitorTime`: 500 ms `−1 s` → 0 ms a `00.00`, ne záporek.
- [ ] `shiftCompetitorTime` nad závodníkem bez času vrátí tentýž objekt.
- [ ] `shiftCompetitorTime` s `leadingUnit: 'minutes'` drží tvar `00:13.50`.
- [ ] `clearCompetitorTime` dá `time: null` a placeholder podle vedoucí jednotky.
- [ ] `useLongPress`: puštění po 300 ms → krátká větev, dlouhá ne.
- [ ] `useLongPress`: podržení 600 ms → dlouhá větev; puštění potom **nespustí** krátkou.
- [ ] `useLongPress`: `pointercancel`, odjetí i pohyb o 20 px zruší obě větve.
- [ ] Obrazovka: počítadlo `0 / 3` → `1 / 3` po uložení času → zpět `0 / 3` po resetu.
- [ ] Obrazovka: karta bez času nemá ±, po uložení je má.
- [ ] Obrazovka: `+1 s` zvedne čas té karty o vteřinu, nezmění cizí kartu ani velký čas.
- [ ] Obrazovka: stisk `+1 s` nepřepíše čas aktuálním (asertuje se hodnota, ne jen render).
- [ ] Obrazovka: podržení karty s časem ji vrátí na `--.--` a počítadlo o jedna dolů.
- [ ] Nastavení: tři závodníci `A, B, C`, křížek u `B` → zbudou `A, C` a počet je 2.
- [ ] Nastavení: při dvou závodnících jsou křížky `disabled`.

**Rizika a zařízení:**

- **Podržení na iOS.** Dlouhý stisk vytáhne výběr textu a callout menu. Karta potřebuje
  `user-select: none` a `-webkit-touch-callout: none`, jinak se místo smazání času
  označí jméno. **Ověřit na telefonu, headless prohlížeč tohle neukáže.**
- **Pointer eventy v jsdom.** `userEvent` 14.6 je umí posílat, ale spolehnout se na to
  bez měření nejde. Když se ukáže, že ne, spadne to na `mouse*` + `touch*` — rozhodne
  spuštěný test, ne odhad. Hook je kvůli tomu samostatný: jeho testy jsou levné a chytí
  to dřív než testy obrazovky.
- **Layout karty.** `.competitor-card` je 120 px vysoká, `min-width: 150px`, v mřížce
  `1fr 1fr 1fr` s `2.5vw` mezerami. Na 375 px vychází sloupec ~110 px, tedy **už dnes
  pod deklarovaným minimem**; dvě tlačítka uvnitř to zhorší. Změřit s osmi závodníky
  na 375×667 a 412×915, na výšku i na šířku, v obou motivech — a když to nevyjde,
  je řešením řádek ± pod časem přes celou šířku karty, ne menší písmo.
- **Mrtvý selektor.** Třída `advanced-interval-del-btn` je scopnutá pod intervalovým
  wrapperem (`SetUpAdvancedInterval.scss:32`), takže samotná třída sem přenesená
  nic neudělá — přesně ta past, na kterou upozorňuje ticket 002.
- **Sdílený `store` v testech** prosakuje mezi bloky (ticket 002 i 003). Oba nové testy
  obrazovek si stav nastaví v `beforeEach`.

**Předpoklady:**

- ± se ukazuje jen na kartě s uloženým časem; na prázdné nemá co posouvat.
- Horní mez posunu **není** — čas smí přesáhnout aktuální běžící čas. Je to oprava
  ručně zapsaného měření, ne validace.
- Podržení funguje ve všech fázích, stejně jako klik dnes (i před startem, kde klik
  ukládá nulu — existující chování, nesahám na něj).
- **`parseMinTime` ořezává, ne zaokrouhluje, a plovoucí čárka to místy posune o setinu:**
  změřeno, že 12 340 ms se zobrazí jako `12.33`. Je to chování celé appky včetně velkého
  času, ne něco, co ± přináší — proto se testy píšou na uložené milisekundy a na hodnoty,
  kde je zobrazení jednoznačné (12 500 → `12.50`), a **rounding se v tomhle ticketu
  neopravuje**.

**Otevřené otázky:** žádné — všechny tři z fáze zadání jsou zodpovězené na gatu `B`.
