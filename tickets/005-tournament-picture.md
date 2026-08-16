---
id: 005
slug: tournament-picture
title: Přehled turnaje jako obrázek
status: idea
branch: tournament-picture
---

# Přehled turnaje jako obrázek

## A — Nápad

<!-- append-only, nikdy nepřepisovat -->

### 2026-08-16

Z nápadu k [ticketu 004](./004-tournament-export.md), doslova:

„respektive stažení „grafického" přehledu turnaje by šlo jako stažení obrázku zobrazené
tabulky nebo pavouka"

Na gatu ticketu 004 rozhodnuto: **vlastní ticket, ne součást exportu do CSV.**

### Co už je zjištěné (a jde to proti intuici)

U CSV je jednodušší skupina a složitější pavouk. **U obrázku je to obráceně:**

- **Pavouk je čisté SVG** — `TreeNode.tsx:47` kreslí jen `rect` a `text`, žádný
  `foreignObject`. Obrázek z něj jde udělat serializací do canvasu **bez nové závislosti**
  a v plné šířce pavouka, ne jen toho výřezu, co je vidět na obrazovce.
- **Skupinová tabulka je HTML mřížka** — `GroupTournamentScreen.tsx:48`, se zamrzlým
  řádkem a sloupcem a scrollem. Na její obrázek je potřeba `dom-to-image` nebo podobná
  závislost a stejně se musí vykreslit mimo obrazovku, aby nebyla oříznutá.

Otevřené věci pro zadání: písmo v serializovaném SVG (fallback, když se nepřenese
`font-family`), tmavý motiv, a jestli se obrázek na telefonu chová v `navigator.share`
jinak než CSV — MIME `image/png` je jiný případ než `text/csv` a ten už jednou překvapil.
