import { render } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ReopenTreeFightModal } from '../ReopenTreeFightModal'
import { store } from '../../../../redux/store'
import {
  setKumiteTimerTournament, setTournamentFight, setTournamentState,
} from '../../../../redux/kumiteTimer/actions'
import { selectKumiteTimerTournamentTree } from '../../../../redux/kumiteTimer/selector'
import { selectTranslation } from '../../../../redux/page/selector'
import {
  Competitor, Fight, FightType, newCompetitor, newFight, TournamentTreeNode, updateTournamentTree,
} from '../../../../types/tournament'


const roster = (count: number): Competitor[] => {
  return Array.from({ length: count }, (_, i) => newCompetitor(`C${i + 1}`))
}

/** A repechage as `updateRepechageTree` leaves one: a root carrying the lines below it. */
const repechageWith = (...lines: FightType[]): TournamentTreeNode => ({
  name: '',
  attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
  children: lines.map((type) => ({
    name: '',
    attributes: { fight: newFight('C4', 'C4', 'C2', 'C2', type) },
    children: [],
  })),
})

const bracket = (count: number): TournamentTreeNode => {
  store.dispatch(setKumiteTimerTournament(90, 'Cup', 'TREE', count, roster(count)))
  return selectKumiteTimerTournamentTree(store.getState()) as TournamentTreeNode
}

/** Plays every given fight for aka, so the results reach the fights above them. */
const play = (tree: TournamentTreeNode, ...fights: Fight[]): TournamentTreeNode => {
  return fights.reduce((acc: TournamentTreeNode, fight) => updateTournamentTree(acc, {
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
  }) as TournamentTreeNode, tree)
}

const open = (tree: TournamentTreeNode, repechage: TournamentTreeNode | null, fight: Fight | null): void => {
  store.dispatch(setTournamentState([], tree, repechage))
  store.dispatch(setTournamentFight(fight))

  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer/tournament']}>
        <ReopenTreeFightModal />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const t = (): { text: string, textSemifinal: string, textRepechage: string } => {
  return selectTranslation(store.getState()).kumiteTimer.setUpScreen.tournament.reopenTreeFightModal
}

/** The dialog says one thing or the other, never both, so a missing body is a failure. */
const body = (): string => {
  const element = document.querySelector('.body')
  if (element === null) {
    throw new Error('the dialog rendered no body')
  }
  return element.textContent ?? ''
}

const saysSemifinal = (): void => {
  expect(body()).toContain(t().textSemifinal)
  expect(body()).not.toContain(t().text)
}

const saysGeneral = (): void => {
  expect(body()).toContain(t().text)
  expect(body()).not.toContain(t().textSemifinal)
  expect(body()).not.toContain(t().textRepechage)
}

const saysRepechage = (): void => {
  expect(body()).toContain(t().textRepechage)
  expect(body()).not.toContain(t().text)
}

/**
 * The dialog before reopening a finished fight. Its whole value is that what it says is
 * true: a promise to reset a repechage that was never built teaches people to click the
 * question away, and the next one will be the one that mattered.
 */
describe('ReopenTreeFightModal', () => {
  test('promises the repechage reset where there is a line to reset', () => {
    // arrange - eight competitors, the first line already built
    const tree = bracket(8)
    // act
    open(tree, repechageWith('REPECHAGE_1', 'REPECHAGE_2'), tree.children[0].attributes.fight)
    // assert
    saysSemifinal()
  })

  test('says nothing about resetting a repechage that was never built', () => {
    // arrange - four competitors, where a semifinalist has beaten nobody to bring back
    const tree = bracket(4)
    // act
    open(tree, null, tree.children[0].attributes.fight)
    // assert
    saysGeneral()
  })

  /**
   * The case the whole ticket is about, in the shape it is hardest to get right: here the
   * question is asked for a real reason - the final is played and its result belongs to
   * somebody who may not reach it - so anything that reads "should we ask?" as "will the
   * repechage go?" says the wrong sentence.
   */
  test('says nothing about the repechage even when it does ask, in a bracket of four', () => {
    // arrange
    const empty = bracket(4)
    const semis = play(empty, empty.children[0].attributes.fight, empty.children[1].attributes.fight)
    const played = play(semis, semis.attributes.fight)
    // act
    open(played, null, played.children[0].attributes.fight)
    // assert
    saysGeneral()
  })

  test('says nothing about the repechage for the semifinal whose line is not built yet', () => {
    // arrange - eight competitors, only the first semifinal decided, so only its line exists
    const tree = bracket(8)
    // act
    open(tree, repechageWith('REPECHAGE_1'), tree.children[1].attributes.fight)
    // assert
    saysGeneral()
  })

  test.each(['REPECHAGE_1', 'REPECHAGE_2'] as FightType[])(
    'speaks about the repechage line for a %s fight',
    (type) => {
      // arrange - the line a bracket of sixteen builds: two fights, one above the other
      const tree = bracket(16)
      const bottom = newFight('C7', 'C7', 'C5', 'C5', type)
      const line: TournamentTreeNode = {
        name: '',
        attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
        children: [{
          name: '',
          attributes: { fight: { ...newFight('C5', 'C5', 'C2', 'C2', type), winner: 'RED' } },
          children: [{ name: '', attributes: { fight: bottom }, children: [] }],
        }],
      }
      // act
      open(tree, line, bottom)
      // assert
      saysRepechage()
    },
  )

  test('does not fall over with no fight selected', () => {
    // arrange - the fight and the modal are cleared in one handler, so this is a moment
    // React is free to render
    const tree = bracket(4)
    // act + assert
    expect(() => open(tree, null, null)).not.toThrow()
  })
})
