import { fireEvent, render } from '@testing-library/react'
import { Fouls } from '../Fouls'


const circles = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('.foul-circle')]

const renderFouls = (isMirror: boolean, onChange: (fouls: number) => void, fouls = 0): void => {
  render(<Fouls isRed fouls={fouls} isMirror={isMirror} onChange={onChange} />)
}

describe('Fouls', () => {
  test('gives the foul whose circle was pressed', () => {
    // arrange
    const given: number[] = []
    renderFouls(false, (fouls) => given.push(fouls))
    // act
    fireEvent.click(circles()[2])
    // assert
    expect(given).toEqual([3])
  })

  test('takes the last foul back when the circle already standing is pressed', () => {
    // arrange
    const given: number[] = []
    renderFouls(false, (fouls) => given.push(fouls), 3)
    // act
    fireEvent.click(circles()[2])
    // assert
    expect(given).toEqual([2])
  })

  /**
   * The mirror is a display for the hall, and it holds no fight of its own: a foul given
   * there changes what the hall reads and nothing else, so the table and the display then
   * disagree about the score with no way of telling which one is right. Score already
   * answers to nobody there; fouls did not.
   */
  test('answers to nobody in the mirror', () => {
    // arrange
    const given: number[] = []
    renderFouls(true, (fouls) => given.push(fouls))
    // act
    fireEvent.click(circles()[2])
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
