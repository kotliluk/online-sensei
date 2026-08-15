# Online Sensei — pracovní kontext

Tréninkový asistent pro karate. **Čistě klientská SPA** — Vite + React 19 + TypeScript +
Redux Toolkit + SCSS. Žádný backend, žádná DB, žádné přihlášení. Stav žije v redux,
v `localStorage` a v URL.

```bash
yarn dev        # http://localhost:5173/online-sensei/
yarn dev:https  # totéž přes https na lokální síti (telefon)
yarn test       # vitest
yarn lint       # eslint
yarn typecheck  # tsc --noEmit
```

Push na `main` = deploy na GitHub Pages. `base` je `/online-sensei/` — **cesty nikdy
neskládej od kořene domény**, vždy přes router nebo `import.meta.env.BASE_URL`.

## Jazyky

- **Anglicky:** kód, názvy souborů, commit messages, `README.md`.
- **Česky:** tickety v `tickets/`, analýzy, review poznámky, komunikace se mnou.
- Uživatelské texty **nikdy natvrdo v komponentě** — patří do `src/logic/translation/cs.ts`
  i `en.ts` (oba soubory, jinak `Translation` neprojde typecheckem).

## Commit messages

Nejsou to conventional commits. Titulek je **věta v přítomném čase, co ta změna dělá**
(`Log the course of a kumite fight`, `Keep the blob alive long enough for Safari on iOS`),
a tělo je **próza vysvětlující proč** — hlavně to, co se nedá vyčíst z diffu: co se měřilo,
proč zvolená varianta a ne ta zřejmá, na čem to selhalo. Držet tenhle standard je součást
zadání, ne bonus. Podívej se na posledních pět commitů, než napíšeš první.

## Než něco napíšeš

1. Nejde to **odebráním** nebo zjednodušením existujícího kódu?
2. Nejde to **úpravou jediného souboru**?
3. Je v repu **analogický vzor**? (`src/logic/urlState/` pro parsování s fallbackem,
   `src/logic/timing/` pro pausable čas, `src/components/atoms/` pro vstupy,
   `src/redux/<feature>/` pro řez state–actions–reducer–selector.)
4. Teprve pak nový kód.

## Testy

Vitest, `globals: true` — `describe`/`test`/`expect` se neimportují. Soubory v podadresáři
`tests/` vedle testovaného kódu (`src/utils/tests/csv.test.ts`). Uvnitř testu komentáře
`// arrange` / `// act` / `// assert`, opakující se případy přes `test.each`.

Testuje se **logika** (`src/logic/`, `src/utils/`, `src/redux/`, `src/types/`) a chování
obrazovek přes Testing Library. Časovače přes fake timers, ne `sleep`.

## Co testy nechytí

Nejdražší chyby v tomhle projektu byly **chování reálných zařízení**: `navigator.share()`
odmítající MIME s `;charset`, Safari na iOS revokující blob dřív než stáhne, BOM, který
Google Sheets na Androidu zobrazí jako `ï»¿`, secure context, autoplay audia. Appka běží na
tom, co má kdo na turnaji v kapse. **Když se změna dotkne prohlížečového API, sdílení,
zvuku, souborů nebo layoutu, patří k ní ruční ověření na telefonu** — a když neproběhlo,
napiš to na rovinu, nepředstírej zeleno.

## Známý dluh (nepřehlížej, ale ani neopravuj mimochodem)

- `<React.StrictMode>` je vypnutý — feature obrazovky ruší session v unmount cleanupu.
- `yarn lint` hlásí ~74 **preexistujících** warningů (hlavně `react-hooks/exhaustive-deps`).
  Cíl je **nepřidat další**, ne vyčistit je při cizím ticketu.
- Detaily v lokálním `TODO.md` (gitignorovaný).

## Flow

Vývoj vede `/ticket` — viz [`.claude/README.md`](./.claude/README.md).
