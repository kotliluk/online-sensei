---
id: 009
slug: phone-ui
title: Opravy UI na telefonu
status: review
branch: phone-ui
---

# Opravy UI na telefonu

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-23

Z jednorázové revize celého repa (2026-08-19). Jeden ze čtyř ticketů podle dělení, které
zvolil uživatel: „bugfixy / UI/UX fixy / testy/konzistence/lint".

Tenhle je ten, který **se zavírá telefonem, ne testem** — jsdom o layoutu nic neví.

## B — Zadání

**Problém:** Appka běží na tom, co má kdo na turnaji v kapse, a na 360px telefonu jsou
u skupinových stopek z tlačítek „Pauza" a „Zpět" čtyřicetipixelové proužky **bez popisku**,
ke kterým se nedá doscrollovat. Vedle toho je třetina karet závodníků mimo obrazovku
a chybová hláška u formulářů se ukáže jen na `:hover`, který na dotyku nenastane.

**Rozsah:** Layout a čitelnost na telefonu, v obou motivech. Věci měřitelné v prohlížeči
a ověřitelné okem na skutečném zařízení.

**Mimo rozsah:**

- Cokoli, co mění chování → ticket 007.
- **Přeuspořádání intervalů na dotyk.** HTML5 drag-and-drop na telefonu nefunguje a jiná
  cesta neexistuje, takže funkce z README je na hlavní platformě nedosažitelná. Je to ale
  ~25 řádků nové interakce plus dva překlady, tedy nová funkce, ne oprava layoutu —
  vlastní ticket.
- Redesign, a11y/WCAG audit, sjednocování komponent.

**Akceptační kritéria:**

- [x] Na 360, 375 i 412 px se u skupinových stopek, reakcí a intervalového časovače
      vejdou **všechna** tlačítka do viewportu, s popiskem. Změřeno, ne odhadnuto.
- [x] Karty závodníků nepřetékají do stran — na 360 px vyjdou dva sloupce, na desktopu
      víc, bez horizontálního scrollu uvnitř svisle scrollovaného kontejneru.
- [x] Když je pole neplatné a Start zašedlý, je na telefonu **vidět proč** — hláška
      se ukáže i bez `:hover`.
- [~] Hláška se vejde na 360px displej i u krajního pole (dnes má fixních 16 rem).
      **Nereprodukováno** — viz `D`. Pojistka přesto přidána.
- [x] V tmavém motivu je mřížka skupinové tabulky a obrys nerozsvícených kroužků
      u reakcí odlišitelný od pozadí.
- [x] Rychlé dvojité ťuknutí do karty závodníka nezoomne stránku.
- [x] Tlačítka v češtině nejsou „Reset zápas" a „Reset čas", ale „Reset zápasu"
      a „Reset času". Texty v `cs.ts` i `en.ts`.
- [x] Kolečka faulů (`Fouls.scss:12`) jsou na 360px displeji dost velká na prst.
      Dnes z CSS vychází ~32×36 px s mezerou 3,6 px, tedy pod 44 pt i pod 48 dp — a je
      jich pět vedle sebe. Přehmat mezi čtvrtým a pátým faulem přitom **mění vítěze**:
      pátý faul předá zápas soupeři a `defaultWinner` to předvyplní v dialogu, který se
      obvykle jen potvrdí. Změřit v prohlížeči, ne spočítat.
- [x] Kolečka faulů jdou ovládat klávesnicí a čtečka o nich ví. Dnes jsou to
      `<div onClick>` bez `role`, `tabIndex` a jmenovky (`Fouls.tsx:26`) — jediné ovládací
      prvky na obrazovce, které nejsou `<Button>`, takže je Tab přeskočí a u stolku
      s notebookem se faul klávesnicí udělit nedá. V zrcadle ovládací prvky nejsou vůbec
      (od ticketu 007), takže tam patří opak: nefokusovatelné a pro čtečku skryté.

**Technicky** (malá dráha, `C` se nepíše):

Naměřené hodnoty a screenshoty:
[report z revize](https://claude.ai/code/artifact/41b49176-0f80-4a4c-9c69-3a3796bb2d22).

Poslední dvě kritéria přibyla z review ticketu 007 (2026-08-25) — `device-ux` je našel na
řádcích, na které ten ticket sahal, ale obojí je preexistující a mění UI, takže sem.

- **Řada tlačítek přetéká:** čtyři tlačítka po 8 rem + marginy = 544 px, rodič má
  `overflow: hidden` a `bodyScrollWidth` se rovná viewportu, takže useknuté části nejdou
  doscrollovat. **Vzor už v repu je** — `KumiteTimerScreen.scss:45` má `flex-wrap: wrap`
  a `row-gap` i s komentářem, který přesně tenhle problém popisuje (ticket 001). Přenést
  do `GroupStopwatchScreen.scss:27`, `ReactionsScreen.scss:54`, `IntervalTimerScreen.scss:23`.
- **Mřížka karet:** `grid-template-columns: 1fr 1fr 1fr` + `min-width: 150px` dá 477–481 px
  do kontejneru širokého 360–412. Nahradit `repeat(auto-fill, minmax(150px, 1fr))` —
  jeden řádek, žádné media queries. *(Preexistující a známé z ticketu 006, kde jsme to
  vědomě nechali být.)*
- **Hláška jen na hover:** `atoms/input/Input.scss:43` má `&.invalid:hover .__input-msg`.
  Rozšířit na `&.invalid:hover, &.invalid:focus-within` a přidat `max-width: 90vw`.
- **Tmavý motiv:** `$black` natvrdo v `TournamentScreen.scss`, `ReactionsScreen.scss:22`,
  `Fouls.scss:18`, `Results.scss:19` — kontrast linek 1,84 : 1 proti `#36393f`. Nahradit
  `t($primary-text)` uvnitř `@include themed`.
- **Zoom při dvojťuku:** `touch-action` není v repu nikde. `touch-action: manipulation`
  na `.competitor-press` a na tlačítka ±1 s.
- **Skládané popisky:** `KumiteTimerScreen.tsx:386` a `FightStats.tsx:62` skládají
  `${ct.reset} ${ct.fight.toLowerCase()}`, což funguje jen anglicky. Správné znění v repu
  už je — `cs.ts:205` má `'Reset zápasu'`. Zavést plné klíče a skládání zrušit.

**Rizika a zařízení:** tohle je celé o zařízení. Layout změřit v prohlížeči na 360, 375
a 412 px a na šířku; kontrast v tmavém motivu spočítat, ne odhadnout okem (past z ticketu
002). Pak **ověřit na skutečném telefonu** přes `yarn dev:https` — hlavně `focus-within`
u hlášky a `touch-action` u dvojťuku, protože obojí se v emulovaném viewportu chová jinak
než pod prstem.

**Předpoklady:**

- Dvousloupcová mřížka na telefonu je lepší než tři useknuté sloupce. Kdyby se ukázalo,
  že se pak na obrazovku vejde míň závodníků, než je při měření potřeba, je alternativa
  zmenšit `min-width` karty — ale to je rozhodnutí uživatele, ne implementace.

## D — Hotovo

Branch `phone-ui`, 6 commitů. `git diff main..HEAD --shortstat`: 19 souborů, +463 / −63
(z toho ticket a README 258 řádků, kód a testy 205).

### Čím se měřilo

Repo nemá prohlížečovou automatizaci a jsdom o layoutu neví nic, takže na tenhle ticket
vzniklo jednorázové měřidlo mimo repo: ~150 řádků nad Chrome DevTools Protocol (node 24
má `WebSocket` i `fetch` v jádře, žádná závislost). Otevře dev server na 320/360/375/412/
768/1280 px v obou motivech, projde obrazovky, přečte `getBoundingClientRect` a
`getComputedStyle` a udělá screenshoty. **Každé číslo níž je odtud, ne z hlavy.**
Kontrastní poměry jsou spočítané z hexů motivu (past z ticketu 002 — okem se to
neodhaduje).

Měřidlo je v `$CLAUDE_JOB_DIR/tmp` a s jobem zmizí. Kdyby se hodilo natrvalo, je to
vlastní ticket, ne přílepek k tomuhle.

### Kritérium po kritériu

| Kritérium | Před | Po | Kde |
| --- | --- | --- | --- |
| Tlačítka ve viewportu (360/375/412) | 2 ze 4 mimo na všech třech šířkách u stopek; 2 ze 3 mimo u reakcí a intervalů na 360 a 375. Na 360 začíná první na −88 a poslední končí na 448, a `.app` má `overflow-x: hidden`, takže **nejde k nim doscrollovat** | 0 mimo na všech třech, žádný popisek useknutý | `GroupStopwatchScreen.scss`, `ReactionsScreen.scss`, `IntervalTimerScreen.scss` |
| Karty závodníků | 3 sloupce, mřížka 477 px v 360px telefonu, 2 karty z každé řady mimo, wrapper scrolloval do stran | 320/1, 360/2, 375/2, 412/2, 768/4, 1280/6 sloupců, nic mimo, nikde vodorovný scroll | `GroupStopwatchScreen.scss` |
| Hláška bez `:hover` | fokus na neplatném poli ukázal 0 ze 2 hlášek na všech třech šířkách | 2 ze 2 na všech třech | `Input.scss` |
| Hláška se vejde na 360 px | **nereprodukováno** — na pěti set-up obrazovkách je každý box 256 px a vejde se i na 320 px (nejhorší pravý okraj 313 při 360, 309 při 320). Příčina: telefon skládá popisek nad pole, takže pole vyjde na střed | pojistka `css-min(16rem, 90vw)` + vystředění přes `transform` místo posunu o půl šířky | `Input.scss` |
| Tmavý motiv | linky `1px solid $black`: 2,70 : 1 na pozadí obrazovky, 1,81 : 1 na buňkách skupinové tabulky — obojí pod 3 : 1 | 7,78 : 1 a 11,58 : 1; ověřeno i v prohlížeči (`rgb(0,0,0)` → `rgb(255,255,255)` v tmavém, světlý beze změny) | `TournamentScreen.scss`, `ReactionsScreen.scss`, `Results.scss`, `Fouls.scss` |
| Dvojťuk nezoomne | `touch-action` nebyl v repu nikde | `manipulation` na kartě, na tlačítkách ±1 s a na kolečkách faulů (potvrzeno v computed style) — **ale skutečný dvojťuk umí jen prst**, viz „Ověřeno na" | `GroupStopwatchScreen.scss`, `Fouls.scss` |
| Reset zápasu / Reset času | skládalo se `${reset} ${fight.toLowerCase()}` → „Reset zápas" | plné klíče `resetFight` a `resetTime` v obou jazycích; test žádá obě mutace, angličtina je kontrola | `cs.ts`, `en.ts`, `KumiteTimerScreen.tsx`, `FightStats.tsx` |
| Kolečka na prst | 32,4 × 38 při 360, 33,8 při 375, 37,1 při 412; mezera 3,6 px | 48 × 48 na všech telefonních šířkách; 3 + 2 na 320–375, 4 + 1 na 412, pět v řadě od tabletu | `Fouls.scss` |
| Kolečka na klávesnici | `tabbable: 0` | 5 tlačítek, jmenovka „AKA faul 4", `aria-pressed`; v zrcadle `<div>` + `aria-hidden`; sedm testů | `Fouls.tsx`, `Fouls.test.tsx` |

### Odchylky od zadání

- **Řádek faulů se na telefonu zalamuje.** Půlka 360px displeje je 180 px a pět cílů po
  48 px se do ní v jedné řadě nevejde ani teoreticky — buď kolečko zůstane pod hranicí,
  nebo se řada zalomí. Zvolil jsem zalomení, protože kritérium mluví o velikosti.
  Je to **vizuální změna hlavní obrazovky appky**, takže je to k odsouhlasení, ne hotová
  věc; vrátit se to dá jedním `flex-wrap: nowrap`.
- **Diagonála skupinové tabulky** (buňka „sám proti sobě") byla `background: $black`,
  což je v tmavém motivu neviditelné, takže vypadala jako prázdná buňka. Teď je
  `t($primary-text)`, tedy v tmavém bílý blok. Ve světlém se nic nemění. V kritériích to
  nebylo — přibalil jsem to, protože nechat tam `$black`, když linky kolem zbělaly, je
  nekonzistentní. Screenshot obojího jsem viděl; bílý blok je nápadný, ale poctivý.
- **`common.fight` jsem smazal.** Po zrušení skládání ho nikdo nečetl a překladový klíč,
  na který se nikdo neptá, nikdo neudržuje pravdivý.
- **`.play-group-stopwatch-competitors-wrapper` dostal `width: 100%`.** Nebylo v plánu,
  ale bez toho spadla mřížka na jeden sloupec: obrazovka centruje potomky, takže wrapper
  se scvrkl na obsah a mřížka, která si říká o podíl z wrapperu, skončila na jednom
  sloupci. Chycené měřením, ne úvahou.
- **Barva focus ringu.** První verze měla `$orange` — appka ho jinde používá pro
  interakci. Změřeno: 2,70 : 1 na světlém pozadí a 2,88 : 1 na tmavém, tedy propadá
  přesně tomu testu, kterým jsem o dva commity dřív opravoval linky. Teď je to
  `t($primary-text)` (21 : 1 / 7,78 : 1).

### Gotchas

- **`npx browserslist` je odpověď na „můžu použít `aspect-ratio`?"** Nejstarší cíl tohohle
  repa je Chrome 109 a iOS Safari 15.6, takže `aspect-ratio`, `gap` ve flexu, `min()`/
  `max()`, `:focus-within` i `:focus-visible` jsou všude. Nehádat, spustit.
- **V zsh je `$pipestatus[1]`, ne `${PIPESTATUS[0]}`.** Druhé se tiše vyhodnotí na
  prázdno a „ověření exit kódu" pak neověří nic — přesně ta past, kterou popisuje
  ticket 008, jen v jiném shellu.
- **React nepřijme `checked` nastavené za jeho zády.** `input.click()` ani nativní setter
  na controlled checkboxu stav nezmění. Na skutečný klik přes CDP checkbox reaguje.
- **`document.querySelector('.__checkbox_container')` chytí checkbox v menu nastavení**,
  který je na 412px viewportu na x = 652, tedy mimo obrazovku. Půl hodiny to vypadalo
  jako chyba v appce („nejde zapnout Nový turnaj"); appka je v pořádku, mířil jsem vedle.
  Poučení: než prohlásíš appku za rozbitou, ověř, že klikáš na to, co si myslíš.
- **Stav turnaje se dá nasadit přes vlastní kód appky.** Vite servíruje zdroje jako
  moduly, takže `import('/online-sensei/src/redux/kumiteTimer/actions.ts')` přímo ze
  stránky a zavolání `setKumiteTimerTournament(...)` postaví celý stav do `localStorage`.
  Levnější a věrnější než proklikat set-up.

### Ověřeno na

**Chrome 145 headless**, 320/360/375/412/768/1280 px, oba motivy — čísla výš.
Vitest 472 testů zelených (bylo 465), typecheck 0, lint 0 chyb / 61 warningů (stejně jako
`main`). Tab v prohlížeči skutečně dojede na kolečka a focus ring je vidět.

**Neověřeno na skutečném telefonu.** Tohle je ticket, který se zavírá telefonem:
emulovaný viewport neumí prst. Ke zkoušce přes `yarn dev:https`:

1. **Dvojťuk** — skupinové stopky, dvakrát rychle ťuknout do karty závodníka: nesmí
   zoomnout stránku. Totéž na ±1 s a na kolečka faulů.
2. **Hláška u pole** — reakce, set-up, dát minimální interval větší než maximální
   a ťuknout do pole: musí se ukázat červená hláška, i když prst nikde nezůstane.
3. **Kolečka faulů** — kumite časomíra na výšku: dají se udělit čtvrtý a pátý faul, aniž
   by prst uhrál soused? A je zalomení 3 + 2 v pořádku, nebo je pět v řadě důležitější?
4. **Tmavý motiv na skutečném displeji** — skupinová tabulka turnaje a nerozsvícené
   kroužky u reakcí. Poměry sedí, ale AMOLED a jas venku jsou něco jiného než monitor.

## Review

Vícestranné review (`/ticket-review`) **neproběhlo** — v týhle session mám zakázané
pouštět subagenty bez vyžádání. Diff je připravený, stačí říct.

Co jsem našel sám při čtení vlastního diffu (a hned opravil):

- `Fouls.scss` · focus ring v `$orange` má 2,70 : 1 / 2,88 : 1 → `t($primary-text)`
  · **✅ opraveno** (amend commitu s fauly)
- `GroupStopwatchScreen.scss` · `width: 100%` na mřížce bez šířky na wrapperu shodilo
  mřížku na jeden sloupec → wrapper dostal `width: 100%` · **✅ opraveno**

Co zůstává na tebe, protože to je produktové rozhodnutí a ne chyba:

- zalomení řady faulů na telefonu (3 + 2) — viz „Odchylky"
- bílá diagonála skupinové tabulky v tmavém motivu — viz „Odchylky"

