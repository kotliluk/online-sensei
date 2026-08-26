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
import { Competitor, newCompetitor, newFight, TournamentTreeNode } from '../../../../types/tournament'


const roster = (count: number): Competitor[] => {
  return Array.from({ length: count }, (_, i) => newCompetitor(`C${i + 1}`))
}

/** A line as `updateRepechageTree` builds one: a root carrying the lines below it. */
const repechageWithLine = (): TournamentTreeNode => ({
  name: '',
  attributes: { fight: newFight('', '', '', '', 'REPECHAGE_ROOT') },
  children: [{
    name: '',
    attributes: { fight: newFight('C4', 'C4', 'C2', 'C2', 'REPECHAGE_1') },
    children: [],
  }],
})

/** Sets up a bracket of `count`, hands it the given repechage, and opens the first semifinal. */
const openFirstSemifinal = (count: number, repechage: TournamentTreeNode | null): void => {
  store.dispatch(setKumiteTimerTournament(90, 'Cup', 'TREE', count, roster(count)))
  const tree = selectKumiteTimerTournamentTree(store.getState()) as TournamentTreeNode
  store.dispatch(setTournamentState([], tree, repechage))
  store.dispatch(setTournamentFight(tree.children[0].attributes.fight))

  render(
    <ReduxProvider store={store}>
      <MemoryRouter initialEntries={['/kumite-timer/tournament']}>
        <ReopenTreeFightModal />
      </MemoryRouter>
    </ReduxProvider>,
  )
}

const t = (): { text: string, textSemifinal: string } => {
  return selectTranslation(store.getState()).kumiteTimer.setUpScreen.tournament.reopenTreeFightModal
}

const body = (): string => document.querySelector('.body')?.textContent ?? ''

/**
 * The dialog before reopening a finished fight. Its whole value is that it only appears
 * where something is at stake, and that what it says is true - a promise to reset a
 * repechage that was never built teaches people to click the question away.
 */
describe('ReopenTreeFightModal', () => {
  test('promises the repechage reset where there is a line to reset', () => {
    // arrange + act - eight competitors, the first line already built
    openFirstSemifinal(8, repechageWithLine())
    // assert
    expect(body()).toContain(t().textSemifinal)
  })

  test('says nothing about resetting a repechage that was never built', () => {
    // arrange + act - four competitors, where a semifinalist has beaten nobody to bring back
    openFirstSemifinal(4, null)
    // assert
    expect(body()).not.toContain(t().textSemifinal)
    expect(body()).toContain(t().text)
  })
})
