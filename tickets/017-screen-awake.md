---
id: 017
slug: screen-awake
title: Obrazovka nemá zhasínat, když se na ní běží čas
status: review
branch: screen-awake
---

# Obrazovka nemá zhasínat, když se na ní běží čas

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-29

Vypadlo z ověřování ticketu 011 na reálném iPhonu:

„kdyby to šlo, udělal bych aspoň, aby obrazovka automaticky nezhsínala, když je
aplikace otevřená"

Kontext, proč to není kosmetika. Ověření 011 na Androidu ukázalo, že telefon se zhasnutou obrazovkou sice
timery i audio pouští, ale **dekódování zvuku škrtí** — konec zápasu zazněl ve správnou
chvíli, ale zkomoleně a kratší. Zároveň platí, že celý ořez na hranici intervalu
v interval timeru (vědomý kompromis z 011) je problém jen tehdy, když obrazovka zhasne.
Rozsvícená obrazovka tedy neřeší jen pohodlí — odstraňuje důvod poloviny toho, s čím se
011 musela vyrovnávat.

Uživatel u interval timeru zároveň rozhodl, že **dopočítávání přes hranice intervalů se
dělat nebude** („pokud to nepůjde vyřešit jednoduše, nechal bych to být"), právě proto,
že spočítat, která série má po rozsvícení běžet, je při současném tvaru stavu drahé.

## B — Zadání

### Co se mění

Dokud je na obrazovce běžící čas, appka drží **Screen Wake Lock** a telefon obrazovku
sám nezhasne. Nic uživatelsky viditelného nepřibývá — žádné tlačítko, žádný text.

### Rozsah — na kterých obrazovkách

Na **hracích obrazovkách**: kumite timer, interval timer, reakce, skupinové stopky.
Ne na set-up obrazovkách ani na turnajovém stromu.

**Předpoklad**, protože zadání říká „když je aplikace otevřená": doslovné čtení by
znamenalo držet zámek i nad nastavením a nad turnajovým stromem, kde uživatel nic
nesleduje a jen mu teče baterka. Hrací obrazovky jsou přesně ta množina, kde se člověk
dívá na běžící čas a nemá po ruce prst — na tatami drží papír, v tělocvičně stojí deset
metrů od telefonu. Kdyby to mělo platit všude, je to jednořádková změna.

### Postup

- Nový hook `src/logic/hooks/useWakeLock.ts` — vedle `useLSSyncProvider` a spol., ve stejném
  tvaru (efekt, `enabled` parametr, žádný vlastní stav).
- Zavolat ho ve čtyřech hracích obrazovkách. Jeden řádek na obrazovku.
- Ošetřit čtyři věci, které se u tohohle API dělají špatně:
  - **API chybí** (Safari pod iOS 16.4, nezabezpečený kontext) → hook nedělá nic a nespadne.
  - **`request()` odmítne** (slabá baterie, úsporný režim) → chycené, appka běží dál.
  - **Systém zámek sám pustí**, jakmile se dokument schová (přepnutá záložka, zamčení
    ručně). Po návratu se **musí požádat znovu**, jinak zámek platí jen do prvního
    přepnutí a nikdo si toho nevšimne.
  - **Uvolnit při unmountu**, jinak zámek přežije odchod z obrazovky.

### Akceptační kritéria

1. Na hrací obrazovce se po namountování požádá o `screen` wake lock.
2. Když `navigator.wakeLock` neexistuje, hook nic nedělá a nic nespadne.
3. Když `request()` odmítne, výjimka se nepropíše ven a obrazovka funguje dál.
4. Po `visibilitychange` zpátky na `visible` se o zámek požádá znovu, pokud ho systém pustil.
5. Unmount zámek uvolní.
6. Na skryté stránce se o zámek nežádá (žádost by stejně odmítla).
7. Žádný nový uživatelský text (a tedy ani zásah do `cs.ts` / `en.ts`).
8. Žádný nový `react-hooks` warning; typecheck, lint i testy zelené.
9. Ověřeno na telefonu: zápas běží, obrazovka nezhasne — nebo je v `D` napsáno, že to
   neproběhlo.

### Plán testů

`src/logic/hooks/tests/useWakeLock.test.tsx`, s podstrčeným `navigator.wakeLock`
(jsdom ho nemá):

- požádá o zámek při mountu, a je to `'screen'`;
- uvolní ho při unmountu;
- bez `navigator.wakeLock` se nic nestane a nic nespadne;
- odmítnutý `request()` neshodí render;
- po `release` ze strany systému a návratu na `visible` se žádá znovu;
- při `enabled: false` se nežádá vůbec.

### Předpoklady

- **Zámek se drží po celou dobu na hrací obrazovce, ne jen když hodiny běží.** Pauza na
  tatami je přesně ta chvíle, kdy rozhodčí řeší situaci a na telefon nesahá; zhasnutá
  obrazovka v půlce pauzy je horší než ta baterka.
- **Chybějící API se nehlásí uživateli.** Kde není, tam se prostě nic nestane. Hlášku
  „váš prohlížeč neumí…" by nikdo nevyužil a stála by dva překlady a jeden layout.
- **Baterie je vědomá cena.** Appka se používá po dobu tréninku nebo turnajového bloku,
  ne na pozadí celý den, a zhasínající časomíra je horší problém.

## Review

<!-- doplní /ticket-review -->

### 2026-08-29

Paralelní revieweři neběželi (tahle session je má zakázané spouštět), takže review bylo
mutační testování hooku: **8 mutací, po doplnění testu 8 zabitých**. Jedna přežila
a stálo to za opravu:

- `useWakeLock.ts` · **druhá žádost, dokud je první na cestě.** Pojistka `requesting`
  neshodila žádný test. Rychlé prolistování app switcherem vrátí stránku do zobrazení
  dřív, než prohlížeč odpoví na první žádost; bez pojistky se požádá znovu a odpověď na
  tu první drží nikdo — wake lock, který stránka už nemá jak uvolnit, platný do zavření
  záložky. Zamčeno testem, kde prohlížeč otázku přijme a neodpoví.

## D — Hotovo

Nový hook `src/logic/hooks/useWakeLock.ts` a jeden řádek ve čtyřech hracích obrazovkách.
Žádný nový text, žádné nové tlačítko, žádná změna layoutu.

| Soubor | Co se stalo |
| --- | --- |
| `src/logic/hooks/useWakeLock.ts` | nový — drží `screen` wake lock, dokud je komponenta namountovaná |
| `KumiteTimerScreen.tsx`, `IntervalTimerScreen.tsx`, `ReactionsScreen.tsx`, `GroupStopwatchScreen.tsx` | `useWakeLock(isActual)` — `isActual` proto, že obrazovka na cestě k redirectu si zámek brát nemá (stejný důvod, jaký má `useLSSyncProvider`) |
| `README.md` | odstavec v „On a phone" a věta v „A phone that went to sleep" |

Testy **498 → 507**.

### Akceptační kritéria

| # | Stav | Čím |
| --- | --- | --- |
| 1 | splněno | `asks for a screen lock while the screen is mounted` |
| 2 | splněno | `does nothing at all when the browser has no wake lock` |
| 3 | splněno | `carries on when the browser refuses` |
| 4 | splněno | `asks again after the browser took the lock back` |
| 5 | splněno | `gives the lock back when the screen goes away` |
| 6 | splněno | `does not ask for a lock the hidden page could not be given` |
| 7 | splněno | diff se `cs.ts` ani `en.ts` nedotýká |
| 8 | splněno | typecheck 0, lint 0 errors / 59 warnings (baseline 59), 507 testů zelených, build prochází |
| 9 | splněno | ověřeno na Androidu 2026-08-29 — nad zápasem svítí, nad nastavením zhasne; viz „Ověřeno na" |

Nad rámec kritérií přibyla pojistka proti druhé žádosti, dokud je první na cestě — viz
Review.

### Ověřeno na

**Android (Motorola), přes `yarn dev:https` na lokální síti — 2026-08-29.**

| Scénář | Výsledek |
| --- | --- |
| set-up obrazovka, nechat ležet | **OK** — obrazovka zhasla po minutě, tedy zámek se tam nedrží |
| kumite se spuštěným zápasem, nechat ležet | **OK** — po minutě pořád svítí |
| zápas s rozsvícenou obrazovkou dohrát | **atoshibaraku i konec zazněly čistě** |

Ta třetí řádka je ta cenná: **potvrzuje, že za zkomolený konec a chybějící atoshibaraku
z ticketu 011 mohla zhasnutá obrazovka**, ne hodiny a ne zvukový soubor. Zhasnutý displej
nechává timery běžet, ale škrtí dekódování audia tak, že delší signál je zkomolený a kratší
zmizí celý. Rozsvícená obrazovka to odstraňuje — což byl vedle pohodlí druhý důvod, proč
tenhle ticket vznikl.

První dvě řádky dohromady ukazují, že rozsah sedí: zámek platí nad hrací obrazovkou a
nad nastavením ne.

**Nezkoušené zůstává:**

1. **Přepnutí do jiné appky a zpátky** — cesta, kde prohlížeč zámek sebral a hook o něj
   musí požádat znovu. Zamčené testem, na zařízení neověřené; projeví se to tak, že by
   obrazovka po návratu začala zhasínat.
2. **Interval timer a skupinové stopky** — stejný jeden řádek jako v kumite, takže riziko
   je malé, ale je to jiná obrazovka.
3. **Prohlížeč bez wake locku** (Safari pod iOS 16.4). Tam se nemá stát nic — ani chyba.

### Co zůstalo

- **Přepnutí do jiné appky a zpátky** není na zařízení vyzkoušené — viz „Ověřeno na".
  Je to jediná cesta hookem, kterou drží pouze test.
- **Zámek se drží i během pauzy**, ne jen za běhu hodin. Vědomé, důvod je v Předpokladech.
