import { JSX } from 'react'
import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { TreeTournamentScreen } from '../TreeTournamentScreen'
import { store } from '../../../../redux/store'
import {
  setKumiteTimerTournament, setTournamentFight, setTournamentState,
} from '../../../../redux/kumiteTimer/actions'
import { setModalWindow } from '../../../../redux/page/actions'
import {
  selectKumiteTimerTournamentFight, selectKumiteTimerTournamentTree,
} from '../../../../redux/kumiteTimer/selector'
import { selectModalWindowType } from '../../../../redux/page/selector'
import {
  Competitor, Fight, FightType, newCompetitor, newFight, TournamentTreeNode, updateTournamentTree,
} from '../../../../types/tournament'


/**
 * `react-d3-tree` measures a laid out `<svg>` and jsdom lays nothing out, so the real
 * component cannot be rendered - which is how the decision behind a click came to live
 * where nothing could reach it. Replaced here with a list of buttons that call the same
 * `onNodeClick`, so what is under test is this screen's own wiring: which state it hands
 * to the rule, and what it does with the answer. How the bracket is drawn is not.
 */
vi.mock('react-d3-tree', () => ({
  default: ({ data, onNodeClick }: {
    data: TournamentTreeNode,
    onNodeClick: (node: { data: TournamentTreeNode }) => void,
  }): JSX.Element => {
    const nodes: TournamentTreeNode[] = []
    const collect = (node: TournamentTreeNode): void => {
      nodes.push(node)
      node.children.forEach(collect)
    }
    collect(data)

    return (
      <div>
        {nodes.map((node) => (
          <button
            key={node.attributes.fight.uuid}
            data-testid={node.attributes.fight.uuid}
            onClick={() => onNodeClick({ data: node })}
          >
            {node.attributes.fight.type}
          </button>
        ))}
      </div>
    )
  },
}))

const roster = (count: number): Competitor[] => {
  return Array.from({ length: count }, (_, i) => newCompetitor(`C${i + 1}`))
}

/** A line of two, the upper one already decided - what a bracket of sixteen leaves. */
const stackedLine = (bottom: Fight): TournamentTreeNode => ({
  name: '',
  attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
  children: [{
    name: '',
    attributes: { fight: { ...newFight('C5', 'C5', 'C2', 'C2', 'REPECHAGE_1'), winner: 'RED' } },
    children: [{ name: '', attributes: { fight: bottom }, children: [] }],
  }],
})

const repechageWith = (...lines: FightType[]): TournamentTreeNode => ({
  name: '',
  attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
  children: lines.map((type) => ({
    name: '',
    attributes: { fight: newFight('C4', 'C4', 'C2', 'C2', type) },
    children: [],
  })),
})

const play = (tree: TournamentTreeNode, fight: Fight): TournamentTreeNode => updateTournamentTree(tree, {
  uuid: fight.uuid,
  type: fight.type,
  winner: 'RED',
  redPoints: 5,
  redFouls: 0,
  bluePoints: 0,
  blueFouls: 0,
  senchu: 'NONE',
  oppositeFight: undefined,
  log: [],
}) as TournamentTreeNode

const Where = (): JSX.Element => <span data-testid='where'>{useLocation().pathname}</span>

/** Every fight below the semifinals, deepest first, so the semifinals get their names. */
const playableBelowSemifinals = (node: TournamentTreeNode, out: Fight[]): void => {
  node.children.forEach((child) => playableBelowSemifinals(child, out))
  const fight = node.attributes.fight
  if (fight.depth >= 2 && fight.winner === undefined && fight.redUuid !== '' && fight.blueUuid !== '') {
    out.push(fight)
  }
}

/** The bracket with everything up to and including the first semifinal behind it. */
const playedToFirstSemifinal = (empty: TournamentTreeNode): TournamentTreeNode => {
  let tree = empty
  for (;;) {
    const playable: Fight[] = []
    playableBelowSemifinals(tree, playable)
    if (playable.length === 0) {
      break
    }
    tree = playable.reduce(play, tree)
  }
  return play(tree, tree.children[0].attributes.fight)
}

/** Sets the tournament up and renders the bracket; returns the tree that is on screen. */
const renderBracket = (count: number, repechage: TournamentTreeNode | null): TournamentTreeNode => {
  store.dispatch(setKumiteTimerTournament(90, 'Cup', 'TREE', count, roster(count)))
  store.dispatch(setModalWindow('NONE'))
  store.dispatch(setTournamentFight(null))

  const empty = selectKumiteTimerTournamentTree(store.getState()) as TournamentTreeNode
  const tree = playedToFirstSemifinal(empty)
  store.dispatch(setTournamentState([], tree, repechage))

  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer/tournament']}>
        <TreeTournamentScreen />
        <Where />
      </MemoryRouter>
    </ReduxProvider>,
  )

  return tree
}

const clickFight = (fight: Fight): void => {
  fireEvent.click(screen.getByTestId(fight.uuid))
}

const modal = (): string => selectModalWindowType(store.getState())
const selected = (): Fight | null => selectKumiteTimerTournamentFight(store.getState())
const where = (): string => screen.getByTestId('where').textContent ?? ''

describe('TreeTournamentScreen - pressing a fight', () => {
  test('asks first where reopening it would cost the repechage', () => {
    // arrange - eight competitors, the first semifinal played and its line standing
    const tree = renderBracket(8, repechageWith('REPECHAGE_1'))
    // act
    clickFight(tree.children[0].attributes.fight)
    // assert - the repechage has to reach the rule, or the question never gets asked
    expect(modal()).toBe('REOPEN_TREE_FIGHT')
    expect(where()).toBe('/kumite-timer/tournament')
  })

  test('goes straight to the fight where there is no line to lose', () => {
    // arrange - four competitors, so the semifinalist brings nobody back
    const tree = renderBracket(4, null)
    // act
    clickFight(tree.children[0].attributes.fight)
    // assert
    expect(modal()).toBe('NONE')
    expect(where()).toBe('/kumite-timer')
  })

  test('opens a fight nobody has played yet', () => {
    // arrange
    const tree = renderBracket(4, null)
    // act - the other semifinal, which is still open
    clickFight(tree.children[1].attributes.fight)
    // assert
    expect(modal()).toBe('NONE')
    expect(where()).toBe('/kumite-timer')
  })

  test('asks before reopening a repechage fight the line has built on', () => {
    // arrange - the lower fight of a line whose upper fight is already decided
    const bottom = { ...newFight('C7', 'C7', 'C5', 'C5', 'REPECHAGE_1'), winner: 'BLUE' as const }
    renderBracket(8, stackedLine(bottom))
    // act
    clickFight(bottom)
    // assert - the repechage is a bracket of its own, and this fight has one above it
    expect(modal()).toBe('REOPEN_TREE_FIGHT')
  })

  test('does nothing for a fight that is half empty', () => {
    // arrange - the final, waiting for the second semifinal
    const tree = renderBracket(4, null)
    // act
    clickFight(tree.attributes.fight)
    // assert - selecting it would put an unplayable fight on the timer screen
    expect(selected()).toBeNull()
    expect(where()).toBe('/kumite-timer/tournament')
  })
})
