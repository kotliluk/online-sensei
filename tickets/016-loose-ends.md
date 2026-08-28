---
id: 016
slug: loose-ends
title: Drobky ze zbývajících ticketů
status: idea
branch: loose-ends
---

# Drobky ze zbývajících ticketů

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-28

Z přehledu zbývající práce po mergi ticketu 009. Uživatel:

„zapiš vite.config.ts:26 a .play-reactions do 016, kam budeme zatím odhazovat drobky ze
zbývajících 4 ticketů a uděláme je pak najednou"

Tenhle ticket je **sběrné místo**, ne jedna změna. Patří sem nálezy, které jsou samy o sobě
moc malé na vlastní ticket a nespadají do rozsahu žádného z běžících (010–013). Sekce `B`
se napíše, až se nasbírá dávka, kterou má smysl udělat najednou — do té doby se sem jen
připisují další drobky, každý s datem a s ukotvením na `path:line`.

**Drobek 1 — `vite.config.ts:26`: deklarovaný cíl buildu si protiřečí s `browserslist`.**

`cssTarget` obsahuje `'safari14'`, zatímco `npx browserslist` hlásí jako nejstarší cíl
`ios_saf 15.6`. Pod tou laťkou jsou `aspect-ratio`, `gap` ve flexu i `:focus-visible` —
tedy věci, které ticket 009 do repa vědomě zavedl. Build se tím nemění (esbuild nic
nepolyfilluje ani nevaruje), nepravdivý je jen deklarovaný kontrakt; komentář u něj navíc
mluví o něčem jiném (přepis media queries do range syntaxe, kterou Safari umí až od 16.4).

Volba je mezi „zvednout `cssTarget` na `safari15`" a „nechat a doplnit fallbacky" — a to je
rozhodnutí o build configu, ne oprava. Zdroj: review ticketu 009, `device-ux`, jistota 90.

**Drobek 2 — `.play-reactions` stylují dvě různé obrazovky.**

`IntervalTimerScreen.scss:4` i `ReactionsScreen.scss` cílí na tutéž třídu, protože obě
obrazovky renderují `<main className='play-reactions'>`. Preexistující copy-paste; dnes to
nic nerozbíjí (ticket 009 do obou přidal identický blok), ale ty dvě obrazovky si navzájem
přebíjejí styly a příští změna jedné tiše sáhne na druhou. Zdroj: review ticketu 009,
`device-ux`, jistota 82.

**Nezařazeno vědomě:** třetí nález ze stejného review — tlačítka skóre a času zůstala
32 × 32 px, zatímco kolečka faulů jsou po ticketu 009 48 px, takže častěji používaný prvek
je menší než ten vzácnější. Uživatel ho sem nezařadil; je to vizuální rozhodnutí, ne
nekonzistence v kódu. Žije dál v sekci `Review` ticketu 009.

## Review

<!-- doplní /ticket-review -->
