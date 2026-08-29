---
id: 012
slug: leave-guard
title: Logo v hlavičce obchází potvrzení odchodu
status: review
branch: leave-guard
---

# Logo v hlavičce obchází potvrzení odchodu

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Vyndáno z ticketu 007, protože je to
produktové rozhodnutí přes pět obrazovek, ne oprava. Uživatel:

„založ je taky, ať na ně pak odděleně kouknu a rozhodnu co s nimi"

**Nález:** ticket 003 dal na „Zpět" z rozehraného turnajového zápasu potvrzovací dialog.
Ten guard ale visí **jen na `handleGoBack`**. `PageHeader` (`PageHeader.tsx:11`) je obyčejný
`<Link to='/'>` renderovaný v `App.tsx:23` nad všemi routami — na telefonu je to 5rem pruh
přes celou šířku kousek nad skóre. Ťuknutí na „OnlineSensei" odejde okamžitě, bez ptaní,
a unmount cleanup zahodí log, skóre i fauly. Stejně dopadne prohlížečové „zpět";
v repu není `useBlocker` ani `beforeunload` (ověřeno grepem).

U **skupinových stopek** je to horší: časy žijí jen ve state komponenty (ticket 006 to
vědomě nemění), tlačítko Zpět je za běhu měření schválně disabled — a logo funguje i tehdy.
Osm závodníků, šest doběhlých časů, jedno ťuknutí a je po měření.

**Proč to není bugfix:** je potřeba rozhodnout rozsah, a to rozhodnutí je uživatelovo:

- Má se logo blokovat **na všech pěti** feature obrazovkách, nebo jen tam, kde je co ztratit
  (kumite zápas, stopky s uloženými časy)?
- Má se hlídat i **prohlížečové zpět** a zavření záložky (`beforeunload`), nebo stačí logo?
  `beforeunload` ukáže systémový dialog, který se nedá otextovat a na telefonu působí jinak
  než modál appky.
- Nebo je levnější **logo na feature obrazovkách vůbec nevykreslovat**, případně z něj
  udělat neaktivní znak? Tím zmizí celá třída úniků bez jediného guardu — ale ubere to
  cestu domů člověku, který ji používá záměrně.

Ticket 003 se svým zadáním vědomě omezil na tlačítko „Zpět", takže tohle není jeho
nedodělek, ale rozšíření rozsahu — a to se má rozhodnout, ne dotlačit.

**Souvisí:** stopky by kromě guardu potřebovaly i vlastní potvrzovací modál (dnes žádný
nemají) a texty do `cs.ts` i `en.ts`. Vzor je `LeaveFightModal` z ticketu 003.


### 2026-08-29

Rozhodnutí na tři otázky výš. Uživatel:

„- blokovat na všech pěti
 - blokovat i zpět a zavření
 - klidně ho úplně zneaktivnit"

### 2026-08-29 (gate)

Odpovědi na tři otevřené otázky z `C`. Uživatel:

„1 - jednotně
 2 - v rámci tohoto ticketu
 3 - ok

 pokračuj"

### 2026-08-29 (ověření na Androidu)

Testy ze sekce `D` proběhly na telefonu: 1–5 a 7 ok, u 6 se mobil neptá a PC ano
(„za mě je to takhle ok, neřeš"). K tomu pět připomínek. Uživatel:

„- asi bych pro konzistenci dal potvrzovací dialog i na UI tlačítko „Zpět" u jednotlivého
 zápasu kumite
 - přijde mi, že mobilní/prohlížečové tlačítko „Zpět" nefunguje v obrazovkách nastavení -
 nic nedělá (ani návrat, ani dialog), je to schválně? na těchto obrazovkách bych možnost
 návratu nechal normálně
 - změnil bych hlášku „Nic z toho, co je tady rozdělané, se neukládá — odchodem o to
 přijdeš." v Kumite turnaji, tam toto znění nedává smysl
 - mobilní/prohlížečové tlačítko „Zpět" dá modal i na stránce s přehledem turnaje
 (zobrazení skupiny/pavouka) - tam není o co přijít, nedával bych ho tam
 - UI tlačítko „Zpět" v kumite zápase v turnaji odlišuje, kdy se něco změnilo a podle toho
 ne/zobrazí modal, ale mobilní/prohlížečové tlačítko se ptá vždy"

## B — Zadání

**Problém:** Logo v hlavičce je obyčejný odkaz nad všemi obrazovkami a na telefonu je to
pruh přes celou šířku kousek nad skóre. Jedno ťuknutí odejde bez ptaní a unmount cleanup
zahodí log, skóre i fauly; u skupinových stopek naměřené časy, které nežijí nikde jinde.
Prohlížečové „zpět" a zavření záložky dopadnou stejně. Guard z ticketu 003 visí jen na
tlačítku „Zpět" uvnitř obrazovky, takže hlídá jednu cestu ze čtyř.

**Rozsah:**

- Na **pěti feature obrazovkách** (reactions, kumite zápas, turnajový strom, interval
  timer, skupinové stopky) přestane být logo odkazem — zůstane jako neaktivní nápis.
- **Prohlížečové zpět** (a gesto zpět na telefonu) z těch obrazovek neodejde rovnou, ale
  zeptá se vlastním modálem appky, v aktuálním jazyce.
- **Zavření záložky a reload** vyvolá potvrzení prohlížeče. Ten dialog se otextovat nedá,
  a to je v pořádku — jde o poslední pojistku, ne o hlavní cestu.
- Obrazovky, které dnes žádný potvrzovací modál nemají, ho dostanou.

**Mimo rozsah:**

- **Zrcadlo `/kumite-timer/mirror`.** Je to read-only konzument `localStorage`, nemá
  session a není v něm co ztratit — guard by tam překážel, ne chránil.
- **Set-up obrazovky a rozcestník.** Tam logo zůstane odkazem, jak je.
- **Ukládání rozdělaného stavu**, aby odchod nebyl destruktivní. To je jiný ticket; tenhle
  se ptá, nezachraňuje.
- **Otextování prohlížečového dialogu při zavření.** Prohlížeče to od roku 2017 ignorují.
- **Změna chování tlačítka „Zpět" uvnitř obrazovek.** Podmínka z ticketu 003 (ptát se jen
  když log narostl) zůstává, jak je.

**Akceptační kritéria** (přepsaná po ověření na Androidu — původní znění viz commit
`e9f26cd`; měnila se kritéria 1, 3 a 5, protože otázka se nově řídí stavem, ne cestou):

- [ ] Hlavička ukazuje „OnlineSensei", ale **není odkaz, dokud má obrazovka co ztratit** —
      v DOM není `<a>` a klik nikam nenaviguje.
- [ ] Na rozcestníku, set-up obrazovkách, zrcadle **a na přehledu turnaje** je logo dál
      odkaz na `/`.
- [ ] Prohlížečové zpět z obrazovky, která má co ztratit, neodejde, ale otevře modál.
- [ ] Prohlížečové zpět z obrazovky, kde není o co přijít, **odejde bez ptaní** — přehled
      turnaje i zápas, ve kterém se ještě nic nestalo.
- [ ] Potvrzení odejde tam, kam zpět mířilo; zrušení zůstane a stav je nedotčený.
- [ ] Zavření záložky vyvolá potvrzení prohlížeče jen tam, kde je co ztratit.
- [ ] Vlastní navigace appky se neptá: uložení zápasu, tlačítko „Zpět", dojetí série ani
      redirect po `setNotActual*`.
- [ ] **Tlačítko „Zpět" a prohlížečové zpět dávají stejnou odpověď** — u kumite zápasu obojí
      podle toho, jestli log narostl, a to i u zápasu mimo turnaj.
- [ ] **Zápas dostane otázku o uložení**, ne generickou o ztrátě.
- [ ] Prohlížečové zpět na set-up obrazovkách **normálně funguje** a vrátí o krok zpět.
- [ ] Každý nový text je v `cs.ts` i v `en.ts`.
- [ ] Zrcadlo funguje dál bez ptaní.

**Otevřená otázka pro gate:** Má se zpět ptát **vždycky, dokud obrazovka běží**, nebo jen
**když je co ztratit** (podmínka z ticketu 003)? Jednotné pravidlo je levnější a hlídá
i skupinové stopky, kde dnes nic není; naproti tomu ticket 003 vědomě rozhodl, že zápas
mimo turnaj se neptá, protože se stejně nikam neukládá — a jednotné pravidlo by ho začalo
otravovat otázkou tam, kde tlačítko „Zpět" mlčí. Píšu analýzu na **jednotné pravidlo**;
přepnout na druhou variantu je změna jedné podmínky.

## C — Analýza

Delší, než by stovka řádků diffu čekala, a schválně: **rozhodnutí o routeru se v tomhle
ticketu dělá jednou pro celou appku** a je to jediná věc, kterou by bylo drahé přepsat
zpátky. Zbytek je krátký.

**Reuse / gap:**

| Dílčí věc | Stav | Kde to žije / co reusnu |
| --------- | ---- | ----------------------- |
| Blokování router navigace | ❌ **nejde dnes** | `useBlocker` volá `useDataRouterContext` → `invariant` (`react-router/dist/development/chunk-62JRHF6Z.mjs:6448` a `:6363`). App má `<BrowserRouter>` (`src/index.tsx:35`), což data router **není** — hook by spadl při renderu. |
| Odlišit „zpět" od vlastní navigace | ✅ existuje | Predikát `useBlocker` dostává `historyAction`: `POP` = zpět/vpřed, `PUSH`/`REPLACE` = `navigate()` appky. Guard se tak nemusí ptát, kdo naviguje — router to řekne sám. |
| Potvrzovací modál | ✅ vzor | `LeaveFightModal.tsx` (ticket 003), `ModalHeader`, `Button`, styly `.modal-container`. |
| Hook nad prohlížečovým API | ✅ vzor | `src/logic/hooks/useWakeLock.ts` (ticket 017) — runtime check, cleanup, žádné vyhazování chyb. |
| `beforeunload` | ❌ chybí | V repu nikde (grep přes `src/`). |
| Logo jako odkaz | ✅ | `PageHeader.tsx:11`, renderuje se v `App.tsx:23` nad všemi routami. |
| Seznam chráněných cest | ❌ chybí | Nový čistý modul — potřebují ho dvě různá místa (hlavička a guard), takže nesmí bydlet ani v jednom. |
| Testovací vzor | ✅ | `MemoryRouter` ve 12 souborech, např. `src/tests/app.test.tsx:11`. |

**Kam to přijde:**

- `src/index.tsx` — migrace na data router (viz Postup 1).
- `src/logic/navigation/guardedPaths.ts` + `tests/` — **nové**, čisté.
- `src/components/common/leaveGuard/LeaveGuard.tsx` + `.scss` + `tests/` — **nové**.
- `src/components/common/pageHeader/PageHeader.tsx` + `tests/` — logo, dnes bez testu.
- `src/logic/translation/cs.ts`, `en.ts` — texty modálu.

Pět feature obrazovek se **nemění vůbec**. To je hlavní výsledek analýzy.

**Postup:**

1. **Data router, minimální migrací.** `src/index.tsx` vymění `<BrowserRouter basename>` za
   `createBrowserRouter([{ path: '*', element: <Root /> }], { basename: config.basename })`
   + `<RouterProvider>`. `Root` vyrenderuje `<App /> <ModalContainer /> <LeaveGuard />`.
   **Všechny existující `<Routes>` zůstanou beze změny** — jsou to descendant routes a pod
   splat routou fungují dál. Migrace se tím vejde do jednoho souboru.
2. **`guardedPaths.ts`** — `GUARDED_PATHS` (`/reactions`, `/kumite-timer`,
   `/kumite-timer/tournament`, `/interval-timer`, `/group-stopwatch`) a `isGuardedPath()`.
   Porovnává se na přesnou shodu, ne prefix: `/kumite-timer/set-up` ani
   `/kumite-timer/mirror` chráněné nejsou, a prefix by je chytil.
3. **`PageHeader`** — `useLocation()`, a na chráněné cestě místo `<Link>` `<span>` se stejnou
   třídou. Ne `<a>` bez `href` — to by pořád bylo v `getByRole('link')`.
4. **`LeaveGuard`** — `useBlocker(({ currentLocation, historyAction }) => historyAction === 'POP'
   && isGuardedPath(currentLocation.pathname))`, `beforeunload` navěšený jen dokud jsme na
   chráněné cestě, a při `blocker.state === 'blocked'` modál. Potvrzení volá `blocker.proceed()`,
   zrušení `blocker.reset()`.
5. **Texty** do obou jazyků.

**Modál si `LeaveGuard` renderuje sám** portálem do `#modal-root`, nejde přes redux
`modalWindow` ani přes `ModalContainer`. Důvod: `proceed`/`reset` jsou funkce vázané na
konkrétní blokaci, do redux state je uložit nelze, a most přes React context by přidal
provider kolem `App` i `ModalContainer` jen kvůli dvěma callbackům. Vedlejší zisk: modál
nesdílí modulový store, takže se **neprosákne do dalšího testu** — past, na kterou upozornil
ticket 003. Cena je, že v `ModalContainer` šestý modál vidět nebude; patří tam na to
komentář s odkazem.

**Plán testů:**

- [ ] `isGuardedPath` — `test.each` přes všech pět chráněných cest → `true`, a přes `/`,
      `/kumite-timer/set-up`, `/kumite-timer/mirror`, `/group-stopwatch/set-up`,
      `/interval-timer/set-up` → `false`. (kritéria 1, 2, 8)
- [ ] `PageHeader` v `MemoryRouter` na `/kumite-timer` → `queryByRole('link', { name: /OnlineSensei/ })`
      je `null`, text tam pořád je. (kritérium 1)
- [ ] `PageHeader` na `/` a na `/kumite-timer/mirror` → odkaz existuje a míří na `/`. (kritérium 2)
- [ ] `LeaveGuard` v `createMemoryRouter` + `RouterProvider`, `initialEntries` `['/kumite-timer/set-up', '/kumite-timer']`:
      `router.navigate(-1)` → modál je vidět a cesta je pořád `/kumite-timer`. (kritérium 3)
- [ ] Tentýž test, klik na potvrzení → cesta je `/kumite-timer/set-up`. (kritérium 4)
- [ ] Tentýž test, klik na zrušení → modál zmizí, cesta je pořád `/kumite-timer`. (kritérium 4)
- [ ] `router.navigate('/')` (tedy `PUSH`) z chráněné cesty → **žádný modál**, naviguje se.
      Tohle je test, který drží kritérium 6, a mutace `historyAction === 'POP'` na `true`
      ho musí shodit.
- [ ] `beforeunload` — na chráněné cestě dispatch `new Event('beforeunload', { cancelable: true })`
      je zrušený (`defaultPrevented`), na `/kumite-timer/set-up` není. (kritérium 5)
- [ ] Odchod z chráněné cesty odvěsí `beforeunload` listener — druhý dispatch po navigaci
      pryč už zrušený není.
- [ ] `src/tests/app.test.tsx` musí projít beze změny — je to důkaz, že migrace routeru
      nerozbila renderování obrazovek přes `MemoryRouter`.

**Rizika a zařízení:**

- **Migrace routeru je jediné skutečné riziko.** Prochází jí každá cesta v appce. Kontroluje
  se tím, že `src/tests/app.test.tsx` a 11 testů obrazovek projdou **beze změny**; když by je
  bylo potřeba upravovat, je to signál, že migrace není minimální, a patří to zpátky na gate.
- **`basename` a GitHub Pages.** `config.basename` je `/online-sensei` a v `public/404.html`
  + `index.html:36` žije spa-github-pages přesměrování, které přepíše URL přes
  `history.replaceState` **ještě než React nabootuje**. Na deep linku tak historie začíná
  jinde, než by člověk čekal — chování zpět na první položce historie se musí zkusit
  na nasazené verzi, ne jen lokálně.
- **Android: zpět na první položce historie appku opustí.** Blocker to zastavit nemůže —
  router už tam žádný krok zpět nemá. Zůstává jen `beforeunload`, a ten je na mobilu vrtkavý:
  Chrome ho ukáže jen po skutečné interakci uživatele se stránkou, iOS Safari ho historicky
  ignoruje úplně. **Patří to na telefon**, ne do testu, který by jen zopakoval můj předpoklad.
- **Gesto zpět** (tažení od hrany) na Androidu i iOS chodí přes `popstate` stejně jako
  tlačítko, takže by mělo být pokryté — ale je to přesně ta třída věcí, kterou tenhle repo
  má opakovaně jinak na zařízení než v jsdom. Ověřit.
- **Zrcadlo ve druhém okně** guard nezná a nemá znát; ověřit, že se pořád otevře a zavře
  bez ptaní.

**Předpoklady:**

- **Guard je aktivní, dokud je obrazovka na obrazovce** — neptá se, jestli je zrovna co
  ztratit. Viz otevřená otázka v `B`.
- **Blokuje se jen `POP`.** Vlastní `navigate()` appky (uložení zápasu, tlačítko „Zpět",
  redirect po `setNotActual*`) jde přes `PUSH`/`REPLACE` a guard ho nevidí. Tím je kritérium
  6 splněné konstrukcí, ne podmínkou navíc.
- **Potvrzení odchodu nic nezachraňuje.** Unmount cleanup obrazovek zahodí stav dál, jak to
  dělá dnes; tenhle ticket se ptá, neukládá.
- **Zpět u skupinových stopek zůstane za běhu disabled.** Guard ho neodemyká.
- **Zrcadlo chráněné není** a mezi „pět obrazovek" se nepočítá.

**Otevřené otázky:** žádné — všechny tři zodpovězeny na gate 2026-08-29:

1. **Ptá se jednotně**, dokud je chráněná obrazovka na obrazovce, bez ohledu na to, jestli
   je zrovna co ztratit. Zpět ze zápasu mimo turnaj se tedy nově zeptá, i když tlačítko
   „Zpět" tam podle ticketu 003 mlčí. Je to vědomá odchylka od 003 na jiné cestě ven, ne
   jeho přepsání — tlačítko zůstává, jak je.
2. **Migrace na data router je součástí tohohle ticketu**, ne samostatného.
3. **Zpět na první položce historie na Androidu appku opustí** a blocker tam nedosáhne.
   Přijato jako známá mezera; patří do `D`, ne mezi kritéria.


## D — Hotovo

**Co se udělalo:** Ve dvou kolech. První (`7239a51`, `b89b6aa`) postavil guard na seznamu
cest: logo mrtvé na pěti obrazovkách, prohlížečové zpět a `beforeunload` blokované tam.
Kvůli `useBlocker` přešel `src/index.tsx` z `<BrowserRouter>` na `createBrowserRouter`
jednou splat routou.

Druhé kolo přišlo z **ověření na Androidu** a otočilo odpověď z gatu: otázku publikuje
**obrazovka podle svého stavu** (`useLeaveQuestion`), ne cesta. Tím seznam cest zmizel
úplně — `guardedPaths.ts` je smazaný —, hlavička i guard čtou jednu a tutéž odpověď,
a tlačítko „Zpět" u kumite zápasu na ni přešlo taky. Sada je 529 testů (z 507).

**Akceptační kritéria:**

| # | Kritérium | Stav | Čím |
| - | --------- | ---- | ---- |
| 1 | Hlavička není odkaz, dokud má obrazovka co ztratit | splněno | `PageHeader.tsx:30` · testy „is not a link while there is a %s to lose" |
| 2 | Jinde logo odkazem zůstává (i na přehledu turnaje) | splněno | test „is a link home when there is nothing to lose" |
| 3 | Zpět z obrazovky, která má co ztratit, otevře modál | splněno | test „asks before browser back leaves a screen with something to lose" |
| 4 | Zpět odkud není o co přijít odejde bez ptaní | splněno | test „does not ask when the screen has nothing to lose" |
| 5 | Potvrzení odejde, zrušení zůstane a stav je nedotčený | splněno; stav **konstrukcí** | testy „answered yes" / „answered no" / „the cross … as answering no". Zablokovaná navigace obrazovku neodmountuje — ověřeno na telefonu, ne testem |
| 6 | `beforeunload` jen tam, kde je co ztratit | splněno | tři testy `beforeunload`, včetně odvěšení |
| 7 | Vlastní navigace appky se neptá | splněno | test „lets the app navigate away…"; mutace `NavigationType.Pop` ho shodí |
| 8 | Tlačítko „Zpět" a prohlížečové zpět dávají stejnou odpověď | splněno | `hasBeenPlayed` je jediné čtení pro obojí · test „tells the guard a fight is worth a question only once something happens in it" |
| 9 | Zápas dostane otázku o uložení, ne generickou | splněno | `LeaveGuard.tsx:47` · test „asks a fight about saving rather than about losing" |
| 10 | Zpět na set-up obrazovkách funguje | splněno; **ověřeno na zařízení** | redirecty jsou `replace` ve čtyřech obrazovkách. jsdom s `MemoryRouter` tuhle historii nemodeluje, takže to test nechytá |
| 11 | Nové texty v `cs.ts` i `en.ts` | splněno | `leaveScreenModal`; `Translation` to vynutí typecheckem |
| 12 | Zrcadlo funguje dál bez ptaní | splněno | nepublikuje otázku, takže není co blokovat |

**Odchylky od B/C:** tři, všechny z druhého kola.

- **Seznam chráněných cest zmizel.** `C` ho navrhovala jako sdílený modul pro hlavičku
  i guard. Jakmile otázku publikuje obrazovka, není k čemu — hlavička čte tentýž stav.
  Je to úbytek souboru, ne přírůstek.
- **Přehled turnaje se nehlídá vůbec.** Strom i skupina se ukládají do `localStorage`
  (`KUMITE_TIMER__TOURNAMENT_TREE`, `KUMITE_TIMER__GROUP`) a přežijí odchod, takže tam
  není o co přijít. Naproti tomu `tournamentFight` se z LS vědomě neobnovuje
  (`utils.ts:60`) — proto se hlídá rozehraný zápas a ne strom nad ním.
- **Podmínka u kumite zápasu se rozšířila** ze zápasu v turnaji na jakýkoli zápas, ve
  kterém log narostl. Ruší to rozhodnutí ticketu 003, že zápas mimo turnaj se neptá; test,
  který ho zamykal, je přepsaný a v komentáři nese proč.

**Gotchas:**

- **`useBlocker` spadne pod `<BrowserRouter>`**, ne graciézně — `invariant`
  v `useDataRouterContext`. Testy si na něj musí postavit `createMemoryRouter`,
  `MemoryRouter` nestačí.
- **`waitFor` uspěje hned na prvním pokusu**, takže „po kliknutí je cesta pořád stejná" je
  tautologie. Čeká se na zmizení modálu, které nastane u obou odpovědí.
- **Křížek ve `ModalHeader` má default `onClose` do redux `modalWindow`.** Modál, který
  redux nepoužívá, ho musí přebít, jinak nedělá nic a nechá navigaci viset.
- **Redirect `navigate(...)` bez `replace` rozbíjí zpět.** Rozcestník odkazuje na
  `/kumite-timer`, obrazovka zjistí, že není `isActual`, a pushne set-up — zpět pak skočí
  na `/kumite-timer`, které pushne set-up znovu. Vypadá to, že tlačítko zpět nefunguje.
  Bylo to tak od začátku, jen si toho nikdo nevšiml, dokud zpět nezačalo být sledované.
- **Nová položka ve `State` slice `page` si vyžádá i `VALIDATOR` a `LS_ACCESS`** v
  `utils.ts`, jinak neprojde typecheck. Pro neukládané pole je vzor
  `get: () => initialState.X, set: emptyFunc`, stejně jako u `modalWindow`.

**Ověřeno na:** **Androidu (Motorola)** přes lokální dev server — sedm scénářů ze sekce D
prvního kola. Prošlo: dialog na gesto zpět, obě odpovědi, mrtvé logo na rozehraném zápase,
živé logo na set-up, zrcadlo bez ptaní. Zavření záložky se **na mobilu nezeptalo** (na
desktopu ano) — uživatel to přijal jako známou mezeru, viz `beforeunload` výš.

Z toho ověření vzešlo pět připomínek, které tvoří druhé kolo (viz `A`). **Druhé kolo samo
na telefonu ověřené není** — 529 automatických testů a 15 mutací ano. Zkusit se má znovu:

1. Zápas **mimo turnaj**, skórovat, „Zpět" → má se zeptat a odejít na set-up.
2. Zápas, ve kterém se **nic nestalo**, „Zpět" i gesto zpět → nemá se ptát ani jednou.
3. **Přehled turnaje** (skupina i pavouk), gesto zpět → nemá se ptát, logo má fungovat.
4. **Set-up obrazovka**, gesto zpět → má se normálně vrátit, ne stát na místě.
5. Rozehraný **turnajový zápas**, gesto zpět → hláška má být o **neuloženém zápase**, ne
   generická o rozdělané práci.

## Review

Branch: `leave-guard` · revieweři: **žádní** — paralelní revieweři se v téhle session
nepouštěli, protože je uživatel nevyžádal. Review je vlastní průchod plus **mutační
testování**, stejně jako u ticketu 011.

**Opravit (90–100)**

- [major] `src/components/common/leaveGuard/tests/LeaveGuard.test.tsx` · Test „zrušení
  zůstane na obrazovce" nedokázal chytit záměnu `reset()` za `proceed()`: `waitFor` na
  nezměněnou cestu uspěje na první pokus, tedy dřív, než by navigace stihla dorazit. Test
  tvrdil něco, co je pravda i v rozbité verzi. → Čeká se na zmizení modálu (nastane u obou
  odpovědí) a teprve pak se čte cesta. · **✅ opraveno**
- [major] `src/components/common/leaveGuard/LeaveGuard.tsx` · Křížek v hlavičce modálu
  nebyl pokrytý žádným testem, a přitom by bez `onClose={stay}` spadl na default
  `ModalHeader`, který dispatchuje do redux `modalWindow`. Tenhle modál redux nepoužívá,
  takže by z křížku bylo tlačítko, které nic nedělá — a navigace by zůstala viset
  zablokovaná. → Přidán test „treats the cross in the header as answering no". ·
  **✅ opraveno**

**Zvážit (80–89)**

- `src/components/common/leaveGuard/LeaveGuard.scss` · Vypadá stejně jako
  `LeaveFightModal.scss` z ticketu 003 a je to skoro řádek za řádkem totéž. Nabízí se
  vytáhnout sdílený mixin do `common/modal/mixins.scss`. Neudělal jsem to schválně: je to
  refaktor cizího ticketu uvnitř tohohle a bez vizuální kontroly obou modálů by to byla
  změna naslepo.

**Bez nálezů:** kritérium 6 (vlastní navigace appky se neptá) drží konstrukce, ne podmínka
— mutace `historyAction === NavigationType.Pop` → `true` shodila přesně ten test, který
ji měla shodit.

**Mutační testování:** 10 mutací napříč `guardedPaths.ts`, `PageHeader.tsx`
a `LeaveGuard.tsx`. Po dvou opravách výš **10 z 10 zabito**.


### Druhé kolo — po ověření na Androidu

Branch: `leave-guard` · zdroj nálezů: **uživatel na reálném zařízení**, ne reviewer. To je
v tomhle repu ta cennější polovina; pět z pěti připomínek mířilo na chování, které žádný
z 540 testů prvního kola nepovažoval za špatné, protože všechny testovaly to, co jsem
navrhl, ne to, co dává smysl u tatami.

**Opraveno**

- [major] `guardedPaths.ts` · Otázka se řídila cestou, takže se ptala i tam, kde není o co
  přijít (přehled turnaje), a naopak se ptala vždy tam, kde tlačítko „Zpět" mlčelo. →
  Otázku publikuje obrazovka (`useLeaveQuestion`), seznam cest **smazán**. · **✅**
- [major] `KumiteTimerScreen.tsx:271` · Tlačítko „Zpět" a prohlížečové zpět odpovídaly
  různě. → Jediné čtení `hasBeenPlayed` pro obojí, a rozšířené i na zápas mimo turnaj. · **✅**
- [major] `LeaveGuard.tsx` · Generická hláška „nic se tady neukládá" nedávala u zápasu
  smysl — zápas uložit jde. → Zápas dostává znění z ticketu 003. · **✅**
- [major] `ReactionsScreen.tsx:118` a tři další · Redirect na set-up pushoval místo
  `replace`, takže zpět na set-up obrazovkách nedělalo nic. Pre-existující, odhalené až
  tím, že zpět začalo být sledované. → `{ replace: true }`. · **✅**
- [minor] `LeaveFightModal.tsx:34` · Po rozšíření podmínky ho může otevřít i zápas mimo
  turnaj, ale navigoval natvrdo do turnajového stromu. → Cíl podle `tournamentFight`. · **✅**

**Nálezy mutačního testování (druhé kolo)**

- [major] Nic neověřovalo, že obrazovky otázku vůbec **publikují** — mutace
  `useLeaveQuestion(null)` na kumite zápasu i na stopkách přežily obě. Celá funkce přitom
  na tom stojí. → Dva testy přímo na publikovaný stav. · **✅ opraveno**

**Mutační testování:** 15 mutací napříč `LeaveGuard.tsx`, `PageHeader.tsx`,
`useLeaveQuestion.ts`, `KumiteTimerScreen.tsx` a `GroupStopwatchScreen.tsx`.
Po opravě výš **15 z 15 zabito**.

**Neřešeno na výslovný pokyn:** `beforeunload` se na mobilu neptá. „za mě je to takhle ok,
neřeš."
