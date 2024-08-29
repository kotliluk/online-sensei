# Online Sensei

Online training assistant for karate

## Kumite timer

The basic feature of Kumite timer is counting time, points, and fouls
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
tournament.

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

The group table with results is displayed. Clicking on a upper-right
half starts a clicked fight. Finished fights can be reopened at will.
Last 6 columns show:
- number of wins, draws, losses
- given points, received points, points summary (+/-)
