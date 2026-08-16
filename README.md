# Online Sensei

Online training assistant for karate. Offers multiple features for karate and other sport trainings:
- kumite timer
- reactions
- interval timer
- group stopwatch

## Development

The app is a [Vite](https://vite.dev) + React + TypeScript single page application.

Requirements: Node.js as pinned in `.nvmrc` (`nvm use`) and Yarn via Corepack (`corepack enable`).

```bash
yarn install     # install dependencies
yarn dev         # start the dev server on http://localhost:5173/online-sensei/
yarn dev:https   # the same, exposed on the local network over https
yarn test        # run the test suite (Vitest)
yarn lint        # run ESLint
yarn typecheck   # run the TypeScript compiler
yarn build       # type-check and build into ./build
yarn preview     # serve the production build locally
```

`yarn dev:https` exists because sharing a link and sharing a file both need a
secure context, which a phone reaching the dev server over the local network does
not get from plain http. It serves a self-signed certificate - the phone warns
once, and past the warning both features can be tried out for real.

Pushing to `main` runs lint, tests and the build in GitHub Actions and deploys
the result to GitHub Pages.

## Sharing a set up

The set-up screens of Reactions, Interval timer and Group stopwatch have a
**Share** button. It copies a link that carries the current set up in its query
string, so sending it to someone opens their app with the same values already
filled in:

```
https://kotliluk.github.io/online-sensei/reactions/set-up?rounds=25&signal=350
https://kotliluk.github.io/online-sensei/interval-timer/set-up-advanced?rounds=3&iv=w;Sprint;20,p;Rest;40
https://kotliluk.github.io/online-sensei/group-stopwatch/set-up?count=3&names=Alice,Bob,Charles
```

Only values that differ from the defaults are put in the link, and every one of
them is validated on the way back in - an edited or truncated link falls back to
the defaults field by field instead of failing. Opening a link only fills in the
form; the settings are stored locally once the recipient presses Start.

The parameters stay in the address bar as long as the form still holds them, so
reloading restores the shared set up. They are dropped on the first edit, when
they would otherwise describe something the screen no longer shows.

## Kumite timer

The basic feature of Kumite timer is the timer itself and the management of points and fouls
for a kumite fight. It supports:

- starting/pausing/resuming/restarting/manual changing of time
- increasing/decreasing points
- increasing/decreasing fouls
- giving/cancelling senchu
- mirroring a screen in a new browser tab
- switching sides of aka/ao (separately for original and mirror screen)
- a log of how the fight got to where it is
- exporting that log, with the state of the fight, as a CSV file

### Fight log

Everything that changes the fight is recorded with the clock reading it happened
at, and shown under the buttons in a panel that is closed by default. Which side
was showing on the left is not recorded - that is a matter of the view, not of
the fight.

Presses that belong to one decision are grouped into one line, because that is
how the fight is read back afterwards. Three presses of `+` become `AKA +3`,
which is also how an ippon is called; five presses of the time `-` become one
`2:00 → 1:55`; and a point awarded and taken straight back leaves no line at all.
Grouping is per clock reading rather than per press, so a stoppage where the
referee sorts out an exchange reads as one line even though the clock stood still
for a while - and it never reaches across a reset, a manual change of the clock,
or a fight being reopened, since the same reading comes round again after those.

A fight played in a tournament keeps its log with it, so it survives a reload and
carries on where it left off when the fight is reopened, with the score it was
reopened at marked in the log. In a group table the same fight is listed twice,
once from each corner, and the mirrored copy has aka and ao the other way round
in its log as well as in its score.

### Leaving a fight

Back on a tournament fight sits right next to Save, and it throws the whole fight away -
score, fouls and log. So it asks first, but only when there is something to lose: a fight
nothing has happened in yet is left without a question, and so is a reopened fight until
something new happens in it. What counts as "something happened" is the log having grown
since the fight was opened, which is exactly what the log is for.

A fight played outside a tournament is never asked about. It is not saved anywhere, so
there is nothing to lose by leaving it.

### Exporting a fight

The button next to the fight log toggle writes the fight to a CSV file - shared through the
system share sheet on a touch device, downloaded everywhere else, the same way the group
stopwatch results are, and with the same encoding decisions behind it (UTF-8 with no byte
order mark, semicolons; the reasoning is in that section).

The file is flat: a header and then one row per logged event, with the fight itself
repeated on every row. For a single fight that is redundant, and deliberately so - the
export of a whole tournament is then a concatenation of these rather than a second format.
Columns run identity, then event, then result:

```
Tournament;AKA;AO;Time;Remaining (s);Type;Side;Value;Description;Final AKA points;…
Camp;Aneta;Bob;2026-08-15 22:35:24;118;POINTS;AKA;3;AKA +3;3;0;0;1;AKA
```

A corner is AKA or AO in every column that names one. Event kinds stay raw keys and every
number is written as one, so a file exported in Czech can be filtered and summed the same
way as one exported in English; only the header and the description follow the language of
the app. The clock is in seconds for the same reason: a spreadsheet reads `1:58` as an hour
and fifty eight minutes.

The fight is exported as it stands on the screen, so a tournament fight has no winner in
it - that is chosen a screen later, after leaving the timer.

The application can also manage a tournament. It supports both group
and tree tournament types with up to 64 competitors. There can be only
one tournament started at a time. Starting a basic fight does not affect
an ongoing tournament.

In tournament setting, you can fill tournament name, competitor names,
select its type, and request a random shuffle of competitors in tree
tournament. You can insert comma-separated list of competitor names
to fill the form quickly (e.g., inserted text "Alice, Bob, Charles"
becomes 3 competitors names "Alice", "Bob", and "Charles", it fills
the competitor where it was inserted and 2 following) (that means
competitor names cannot contain a comma character).

### Tree tournament

It is an official competition type with a tree structure and repechage of direct
losers to finalists.

The current tournament tree is displayed with nodes for each fight.
A node shows competitors names, colours (aka/ao). If the fight is finished,
it also shows the points (points of the winner are highlighted).
Clicking on a node starts the fight. Once a finalist is known (after
semifinal), the repechage is computed and displayed below the main tree.

Notes:

- reopening a finished fight only updates its data (points, fouls, winner...)
and the winner is updated as competitor in the subsequent fight. Further
parts of the tree (if finished) are not updated automatically so that competitors
names might become inconsistent
- reopening a finished fight in the main tree does not update competitors
in repechage
- reopening a semifinal resets the dependent half of repechage so that
all repechage results in the half are lost

### Group tournament

It is a competition type with a group of competitors and fights
"each again each".

The group table with results is displayed. Clicking on an upper-right
half starts a fight. Finished fights can be reopened at will.
Last 6 columns show:

- number of wins, draws, losses
- given points, received points, points difference (+/-)

## Reactions

This feature is for reaction exercises where random signals are needed. The signal is both visual
(colorful circle) and sonic (beep sound). You can customize:

- 1-4 circles and their colors
- isual signal duration
- interval for random repetition
- audio on/off

Once started, you can always pause/resume/reset the ongoing exercise.

## Interval timer

This timer is great for work outs and running trainings. It measures given intervals and repeats them
for given number of series. There are two ways of setting the interval timer.

### Basic settings

Basic settings are quick and easy way to start the timer. You can set:

- number of rounds
- duration of work interval
- duration of pause (rest) interval
- audio on/off

Once started, the timer repeats work and pause interval (the number of repetitions is given by the number of rounds). You can always pause/resume/reset the ongoing exercise.

### Advanced settings

In the advanced settings, you can further customize the itervals. You can set the duration of each individual
interval in a single round and its type (work / pause) and name. For example, you can create:

- 20 seconds work: Boxing
- 20 seconds work: Squating
- 30 seconds rest: Running
- 15 seconds work: Sprints
- 25 seconds rest: Stretching

Also, you can set the number of repetitions of this whole round.

## Group stopwatch

Simple but powerful feature is group stopwatch. It helps to measure durations of multiple people at once.
You simple set their count, optionally fill their names, and start the time. When someone finishes,
you save their time by clicking their name. If you misclick, you can update saved time by double-click.
You can always see the result list where you can sort the results by the time, the name or by the starting
number.

The result list can be exported as a CSV file. It holds exactly what the table
shows, in the order it is shown, so the chosen sorting carries over. The file is
UTF-8 without a byte order mark and semicolon separated - spreadsheets do not
read the separator from the file, and a semicolon is what Excel expects in the
European locales this app is used in, while LibreOffice and Google Sheets detect
it either way.

On a touch device the button opens the system share sheet, which hands the file
straight to Drive or a chat and still offers saving it; on a desktop, and
wherever sharing files is not available, it downloads the file instead. Sharing
needs a secure context, so over plain http it always falls back to the download.

One known limitation, in a reader rather than in the file: the Google Sheets app
on Android does not detect the encoding of a local CSV and mangles accented
names. The same file opens correctly on a desktop, in Numbers, in LibreOffice and
in Google Sheets on the web, so a roster with accented names is best opened
there.
