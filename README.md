# Online Sensei

Online training assistant for karate. Offers multiple features for karate and other sport trainings:
- kumite timer
- reactions
- interval timer
- group stopwatch

## Kumite timer

The basic feature of Kumite timer is the timer itself and the management of points and fouls
for a kumite fight. It supports:

- starting/pausing/resuming/restarting/manual changing of time
- increasing/decreasing points
- increasing/decreasing fouls
- giving/cancelling senchu
- mirroring a screen in a new browser tab
- switching sides of aka/ao (separately for original and mirror screen)

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
