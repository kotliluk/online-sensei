---
id: 017
slug: screen-awake
title: Obrazovka nemá zhasínat, když se na ní běží čas
status: approved
branch: screen-awake
---

# Obrazovka nemá zhasínat, když se na ní běží čas

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-29

Vypadlo z ověřování ticketu 011 na reálném iPhonu:

„kdyby to šlo, udělal bych aspoň, aby obrazovka automaticky nezhsínala, když je
aplikace otevřená"

Kontext, proč to není kosmetika. Ověření 011 ukázalo, že iOS na zhasnuté obrazovce sice
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
  - **API chybí** (iOS pod 16.4, nezabezpečený kontext) → hook nedělá nic a nespadne.
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
- **Chybějící API se nehlásí uživateli.** Na iOS pod 16.4 se prostě nic nestane. Hlášku
  „váš prohlížeč neumí…" by nikdo nevyužil a stála by dva překlady a jeden layout.
- **Baterie je vědomá cena.** Appka se používá po dobu tréninku nebo turnajového bloku,
  ne na pozadí celý den, a zhasínající časomíra je horší problém.

## Review

<!-- doplní /ticket-review -->

## D — Hotovo

<!-- doplní uzávěrka -->
