---
id: 003
slug: leave-fight-guard
title: Potvrzení odchodu z rozehraného turnajového zápasu
status: review
branch: leave-fight-guard
---

# Potvrzení odchodu z rozehraného turnajového zápasu

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-16

Ze zpětné vazby k [ticketu 002](./002-fight-export.md):

„na talčítko „Zpět" v turnaji dát potrvzovací dialog, pokud se už v zápase něco stalo
„Opravdu odejít bez uložení?""

## B — Zadání

**Problém:** „Zpět" z turnajového zápasu odejde bez ptaní a rozehraný zápas je pryč —
skóre, fauly i celý log. Tlačítko přitom sedí hned vedle „Uložit zápas", takže je to
překlep vzdálené od hodiny práce u stolku.

**Rozsah:**

- „Zpět" u **turnajového** zápasu se zeptá, když se v zápase už něco stalo.
- Text potvrzení: „Opravdu odejít bez uložení?"
- Když se nic nestalo, odejde se rovnou — ptát se na nic je otrava, ne pojistka.

**Mimo rozsah:**

- Samostatný zápas. Ten se nikam neukládá, takže není o co přijít.
- Automatické ukládání nebo obnova rozdělaného zápasu.

**Akceptační kritéria:**

- [ ] „Zpět" u turnajového zápasu, ve kterém se nic nestalo, odejde na turnajovou
      tabulku bez ptaní.
- [ ] Když se v zápase něco stalo, „Zpět" místo odchodu otevře potvrzení.
- [ ] Potvrzení odejde na turnajovou tabulku; zamítnutí nechá zápas beze změny tam, kde byl.
- [ ] „Zpět" u samostatného zápasu se neptá nikdy.
- [ ] Znovuotevřený zápas, ve kterém se od otevření nic nestalo, se také neptá.
- [ ] Texty v `cs.ts` i `en.ts`.

**Technicky** (malá dráha, `C` se nepíše):

- Nový typ modálu `LEAVE_FIGHT` v `src/types/modalWindowType.ts` + větev
  v `ModalContainer.tsx`; komponenta vedle `FightResultModal.tsx` podle vzoru
  `CancelTournamentModal.tsx`.
- `handleGoBack` v `KumiteTimerScreen.tsx` dostane podmínku; odchod samotný pak dělá modál
  (`setNotActualKumiteTimer` + `navigate`), stejně jako to dnes dělá `FightResultModal`.
- **„Něco se stalo" = log od načtení zápasu vyrostl.** Od ticketu 001 se loguje každá
  změna, takže delší log je přesně „něco se stalo" — a je to jediná varianta, která
  nevyhodí falešný poplach u znovuotevřeného zápasu, kde je log neprázdný od začátku.
  Drží se to refem vedle `loadedFightUuid`.
- Testy: chování obrazovky přes Testing Library (ptá se / neptá se / potvrzení odejde),
  plus browser test na celou cestu.
- Na zařízení: netýká se — žádné prohlížečové API, jen modál, který appka už má.

## D — Hotovo

**Co se udělalo:** Nový modál `LeaveFightModal` podle vzoru `CancelTournamentModal`,
podmínka v `handleGoBack`, texty v obou jazycích. Sada je 151 unit testů (ze 145) a 71
browser testů (z 67).

**Odchylky od B:** jedna. „Něco se stalo" se mělo držet refem vedle `loadedFightUuid`,
ale nový lint rule `react-hooks/immutability` to nedovolí — ref čtený v `useCallback`
a zapisovaný v efektu je chyba, ne warning. Je z toho `useState`, což je stejně poctivější:
je to hodnota, na které závisí, co tlačítko udělá.

**Gotchas:**

- **`ModalContainer` nevisí v `App`, ale v `index.tsx`.** Test, který renderuje jen `<App />`,
  žádný modál neuvidí a spadne na tom, že tlačítko v něm neexistuje.
- **Modál je portál do `#modal-root`**, který je v `index.html`. V jsdom ten element není
  a `createPortal(…, null)` spadne — proto ho zakládá `setupTests.ts`.
- **Otevřený modál prosákne do dalšího testu**, protože stav modálu žije ve sdíleném
  modulovém `store`. Bez `setModalWindow('NONE')` v `beforeEach` pak na stránce visí dvě
  tlačítka „Zpět" a dotazy podle role selžou na nejednoznačnosti. Je to stejná past, na
  kterou upozornilo review ticketu 002 u názvu turnaje.

**Ověřeno na:** desktop Chrome (Playwright, 71/71) a emulovaný viewport 375×667 v češtině
včetně screenshotu modálu. Testy ověřené mutacemi: 4 mutace, všechny 4 zčervenaly, každá
shodila právě ty testy, které měla.

Prohlížečových API se změna nedotýká — je to modál, který appka už má —, takže **ruční
ověření na telefonu tady nedává smysl** nad rámec toho, co už čeká na ticketu 002.
