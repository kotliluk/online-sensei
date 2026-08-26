import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider as ReduxProvider } from 'react-redux'
import { Fouls } from '../Fouls'
import { store } from '../../../../redux/store'
import { setTranslation } from '../../../../redux/page/actions'


const circles = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.foul-circle')]

const renderFouls = (isMirror: boolean, onChange: (fouls: number) => void, fouls = 0, isRed = true): void => {
  render(
    <ReduxProvider store={store}>
      <Fouls isRed={isRed} fouls={fouls} isMirror={isMirror} onChange={onChange} />
    </ReduxProvider>,
  )
}

describe('Fouls', () => {
  test('gives the foul whose circle was pressed', async () => {
    // arrange
    const user = userEvent.setup()
    const given: number[] = []
    renderFouls(false, (fouls) => given.push(fouls))
    // act
    await user.click(circles()[2])
    // assert
    expect(given).toEqual([3])
  })

  test('takes the last foul back when the circle already standing is pressed', async () => {
    // arrange
    const user = userEvent.setup()
    const given: number[] = []
    renderFouls(false, (fouls) => given.push(fouls), 3)
    // act
    await user.click(circles()[2])
    // assert
    expect(given).toEqual([2])
  })

  /**
   * The mirror is a display for the hall, and it holds no fight of its own: a foul given
   * there changes what the hall reads and nothing else, so the table and the display then
   * disagree about the score with no way of telling which one is right. Score already
   * answers to nobody there; fouls did not.
   */
  test('answers to nobody in the mirror', async () => {
    // arrange
    const user = userEvent.setup()
    const given: number[] = []
    renderFouls(true, (fouls) => given.push(fouls))
    // act
    await user.click(circles()[2])
    // assert
    expect(given).toEqual([])
  })

  test('marks the mirror, so its circles do not offer to be pressed', () => {
    // arrange - `cursor: default` hangs on this class, and jsdom carries no stylesheet;
    // what the cursor actually does is on the list for the phone
    renderFouls(true, () => {})
    // act + assert
    expect(document.querySelector('.__fouls')?.classList.contains('__mirror')).toBe(true)
  })
})

/**
 * These were the only controls on the screen that were not buttons: five `<div onClick>`
 * without a role, a name or a place in the tab order. At a table with a laptop and no
 * touchscreen there was therefore no way to give a foul at all - and the fifth foul hands
 * the fight to the other corner, so it is not a control anyone can do without.
 */
describe('Fouls - reachable without a finger', () => {
  afterEach(() => {
    store.dispatch(setTranslation('EN'))
  })

  test('offers five buttons the tab order can reach', () => {
    // arrange + act
    renderFouls(false, () => {})
    // assert
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  test('gives the foul from the keyboard alone', async () => {
    // arrange
    const user = userEvent.setup()
    const given: number[] = []
    renderFouls(false, (fouls) => given.push(fouls))
    // act
    await user.tab()
    await user.tab()
    await user.tab()
    // assert - which circle the tabs arrived at, and not merely that three of them fit
    // before one: a stray focusable element in the row has to fail here, where it is
    // about the tab order, rather than further down where it would read as a broken key
    expect(document.activeElement).toHaveAccessibleName('AKA foul 3')
    // act
    await user.keyboard('{Enter}')
    // assert
    expect(given).toEqual([3])
  })

  /**
   * A `<div role='button' tabIndex={0}>` with a keydown handler for Enter passes every
   * other test in this block. The space bar is what separates it from a real button, so
   * it is the assert that pins the native element rather than an imitation of it.
   */
  test('answers the space bar too, the way a button does', async () => {
    // arrange
    const user = userEvent.setup()
    const given: number[] = []
    renderFouls(false, (fouls) => given.push(fouls))
    // act
    await user.tab()
    await user.keyboard(' ')
    // assert
    expect(given).toEqual([1])
  })

  test('says whether a foul stands, so the state is not carried by colour alone', () => {
    // arrange + act
    renderFouls(false, () => {}, 2)
    // assert
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2)
    expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(3)
    // and the lit circles are the same two - the class and the announced state come from
    // one predicate, and this is what keeps them from drifting into disagreement
    expect(circles().map((c) => c.classList.contains('checked')))
      .toEqual([true, true, false, false, false])
  })

  type NameCase = { name: string, isRed: boolean, expected: string }

  test.each([
    { name: 'aka', isRed: true, expected: 'AKA foul 4' },
    { name: 'ao', isRed: false, expected: 'AO foul 4' },
  ] as NameCase[])('names the corner and the number of the foul - $name', ({ isRed, expected }) => {
    // arrange + act
    renderFouls(false, () => {}, 0, isRed)
    // assert - a row of five unnamed circles is announced as five identical buttons
    expect(screen.getByRole('button', { name: expected })).toBeInTheDocument()
  })

  test('names them in czech too', () => {
    // arrange
    store.dispatch(setTranslation('CS'))
    // act
    renderFouls(false, () => {}, 0)
    // assert
    expect(screen.getByRole('button', { name: 'AKA faul 4' })).toBeInTheDocument()
  })

  /**
   * `aria-hidden` takes the whole subtree out of the accessibility tree, so asking by
   * role proves nothing here - `queryAllByRole('button')` answers zero even when the row
   * is five real buttons. The tab order is a separate claim and needs a separate assert.
   */
  test('offers the mirror neither the tab order nor the screen reader', async () => {
    // arrange
    const user = userEvent.setup()
    renderFouls(true, () => {})
    // act
    await user.tab()
    // assert
    expect(document.querySelector('.__fouls')).toHaveAttribute('aria-hidden', 'true')
    expect(circles().filter((c) => c.matches('button, [tabindex]:not([tabindex="-1"])'))).toHaveLength(0)
    expect(document.querySelector('.__fouls')?.contains(document.activeElement)).toBe(false)
  })
})
