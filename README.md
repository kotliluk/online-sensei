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

## On a phone

The app runs on whatever is in someone's pocket at a tournament, so the screens
are laid out for a phone first and grow from there rather than the other way
round.

**Rows of buttons wrap.** Four buttons of the width a play screen gives them
come to more than a phone is wide, and the page does not scroll sideways, so
anything sticking out would be unreachable rather than merely clipped. They fold
onto a second line instead, at any width where they do not all fit.

**Competitor cards fill the width they have.** The group stopwatch fits as many
150px columns as there is room for - two on a phone, four on a tablet, six on a
desktop - so no card is ever cut off at the edge.

**Error messages answer to a tap.** The message saying why a field is red used
to appear on hover, which a finger never produces. It now appears whenever the
field is focused, so tapping the field says what is wrong with it.

**A double tap does not zoom.** Tapping a competitor card twice in quick
succession is two competitors finishing, not a request to zoom in, and the same
goes for the correction buttons and the foul circles.

**Both themes are legible.** The outlines of the unlit reaction signals, the foul
circles and the rule under the sortable result headings take their colour from the
theme, rather than staying black in a dark theme where black is nearly the
background.

**The screen stays on while a clock is showing.** A phone left alone dims and locks
within half a minute, and on a play screen that means nobody can read the time -
and that the signals come out wrong, because a dark screen keeps the timers running
but throttles the audio: the horn at the end is garbled and atoshibaraku is lost
altogether. The kumite timer, the interval timer, Reactions and the group stopwatch
hold the screen awake for as long as they are open and let go the moment you leave
them. Set-up screens do not, and neither does a browser without a wake lock - Safari
before iOS 16.4, or the app served over plain http.

**The header asks before it takes you home.** The bar with the logo runs the full width
just above the score, which on a phone makes it the easiest thing to hit by accident, and
it used to leave without a word. It is still a working way home from everywhere - it just
stops and asks first whenever the screen showing has something to lose.

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

### The mirror and the horn

The mirror is a display for the hall, so nothing on it can be pressed: the clock, the
score, the fouls and senchu are all read-only there. The one thing it does answer to is
switching sides, because which corner is shown on which side is a matter of the view
rather than of the fight, and the hall looks at the mat from the other end.

The horn at the end, atoshibaraku at fifteen seconds and the "end" entry in the log all
belong to **the clock arriving there on its own**. Setting the time by hand sounds
nothing - giving a few seconds back after the fight has ended is a normal thing to do at
the table, and the horn comes again only once the clock has run out again.

### A phone that went to sleep

The screen does not go dark on its own here any more, but it still can be locked by
hand or left behind for another app. A locked screen or a tab in the background stops
getting timers from the browser, and the ones it missed are never offered again. The
clock counts **what the wall clock says has passed**, not how many of those it was
handed, so a fight comes back from a minute of locked screen a minute shorter rather
than a second. A round that ran out while the
screen was off is over when it comes back on, horn and all. Atoshibaraku is the call for
a fight with under fifteen seconds left, so catching up *past* fifteen still calls it,
late, rather than skipping the round that stepped over the reading without landing on it.

### The foul circles

Five circles per corner, and the fifth of them hands the fight to the other side, so the
row is sized to be hit rather than to fit. Each circle is at least 48px across; where five
of those do not fit the half of the screen a phone gives one fighter, the row wraps onto a
second line instead of shrinking them - three and two on a narrow phone, all five in a
line from a tablet up.

They are buttons, so the tab order reaches them and a foul can be given from a keyboard at
a table with a laptop and no touchscreen. A screen reader names each one by its corner and
number ("AKA foul 4") and says whether it stands, so the state is not carried by colour
alone. On the mirror they are neither: a display for the hall holds no controls, so it
offers none to the keyboard or the screen reader either.

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

A fight played outside a tournament is asked about on the same terms. It is saved
nowhere, which is a reason to warn about leaving it rather than a reason to stay quiet.

**Every way off the screen asks the same question.** The logo in the header, browser back
- and the phone's back gesture, which is the same thing - and closing the tab or reloading,
which gets the browser's own confirmation. All four read one answer from the screen: has
anything happened here yet. So they cannot drift apart and start telling the referee
different things.

Screens with nothing to lose are left alone. The tournament overview is one of them: the
tree and the group table are written to `localStorage` and survive being left, so the way
home works there normally. So does a fight nobody has scored in yet.

Nothing the app does itself is ever interrupted - saving a fight, the Back button, the
redirect after a session ends. What is held is a pop, which is the browser going back, and
a push to the main page, which is the logo and nothing else: every other way the app
reaches the main page starts from a set-up screen, where there is nothing to lose anyway.

One gap is worth knowing about. If a running screen is the first page in the browser's
history - opened straight into, rather than walked to - back leaves the app altogether,
and no page can hold that. What is left there is the browser's own dialog, which on a
phone may not appear at all.

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

Reopening a finished fight asks for confirmation only where something is at
stake: the fight above it in the bracket has already been played, or - for a
semifinal - a repechage line has been built out of its result and would be
thrown away. A repechage line is a bracket in its own right, so a fight in one
is asked about by the same rule as any other. In a tournament of four there is
nobody to bring back, no repechage is built, and a semifinal reopens without a
question until the final has been played.

### Group tournament

It is a competition type with a group of competitors and fights
"each again each".

The group table with results is displayed. Clicking on an upper-right
half starts a fight. Finished fights can be reopened at will.
Last 6 columns show:

- number of wins, draws, losses
- given points, received points, points difference (+/-)

### Exporting a tournament

The tournament screen offers two files, one button each - shared or downloaded exactly as a
single fight is. Two files rather than one download of both, because a single click that
produces two files means an "allow multiple downloads?" prompt on a desktop and two
attachments in one share sheet on a phone.

**The log** is every fight that was played, in the format one fight already has: one header,
then each fight's rows behind each other, oldest first by when the fight started. So a file
of one fight and a file of a whole tournament open the same way, and a filter written for one
works on the other. A fight nobody has stepped into yet is not in it.

**The overview** is the tournament as the screen shows it, and its shape follows the system
because the data has different shapes. A group comes out as the cross table, tally included:

```
;Aneta;Bob;Cyril;W;D;L;+;-;+/-
Aneta;;3:1;;1;0;0;3;1;2
```

A bracket is not a table, so it comes out as a row per fight - the round it belongs to, both
competitors, the score and the winner by name. Only the last two rounds have names of their
own; below that they are counted from the first one, because the bracket of a small
tournament is rarely a full one and "quarterfinal" would be a guess. Repechage lines are
named as such. Fights that have not happened are listed with their results left empty, the
same way the screen shows a dash.

**The picture** is a third button, and it is the tournament as something to look at rather
than to filter - to send to a club chat, to print and pin up by the tatami. It holds the
whole tournament, not the part that happens to be on screen: a bracket is captured wherever
it has been panned and zoomed to, repechage included, and a group table is drawn in full
rather than photographed through its scrolling frame. The background is light whatever theme
the app is in, since a chat or a print does not inherit one.

Its resolution is capped by area rather than fixed. Browsers limit how large a canvas may be
and **exceeding that limit returns a blank image instead of an error**, so a small tournament
is drawn at double resolution while a bracket of 64 - which would otherwise come to 58
megapixels, against the roughly 17 iOS Safari allows - scales itself down instead.

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

The clock measures elapsed time here as well, so a device that slept catches up inside
the interval that was running. It stops at that interval's boundary rather than running
the whole series forward - coming back to a training that finished in your pocket would
be a burst of beeps for rounds nobody did.

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

A cross next to a competitor in the set up removes them; everybody below moves up
and the count goes down with them. Two competitors is the minimum, so at two the
crosses are disabled.

While the clock runs, the number under it says how many competitors already have
a time out of how many there are, so it is clear who is still out there without
counting the cards.

A saved time can be corrected in two ways. The card of somebody who has finished
carries a **−1 s** and a **+1 s** button, which move that one time without touching
the clock or anybody else; a time never goes below zero, and it may end up past the
running clock, because it is a written down measurement rather than a reading of it.
**Holding the card** for over half a second throws its time away and puts the
competitor back among those still running. The hold reacts while the finger is still
down, and a press that travels more than a few pixels is taken as scrolling the list
rather than as a hold - otherwise dragging the list would wipe a time.

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
