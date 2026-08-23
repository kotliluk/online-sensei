import { act, render, screen } from '@testing-library/react'
import { JSX } from 'react'
import { useLSSyncConsumer } from '../useLSSyncConsumer'


const Probe = ({ lsKey }: { lsKey: string }): JSX.Element => {
  const value = useLSSyncConsumer(lsKey, (raw) => raw ?? 'NONE')
  return <span data-testid='value'>{value}</span>
}

const shown = (): string => screen.getByTestId('value').textContent ?? ''

/**
 * The writing side stores everything through `JSON.stringify`, so a string arrives wrapped
 * in quotes. The hook has to hand the parser the same shape whether it is reading the key
 * for the first time or reacting to a change.
 */
describe('useLSSyncConsumer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('the value read at mount is already unwrapped', () => {
    // arrange - what the writing side leaves behind
    localStorage.setItem('K', JSON.stringify('RED'))
    // act
    render(<Probe lsKey='K' />)
    // assert
    expect(shown()).toBe('RED')
  })

  test('a value that changes later is unwrapped too', () => {
    // arrange
    localStorage.setItem('K', JSON.stringify('RED'))
    render(<Probe lsKey='K' />)
    // act
    act(() => {
      localStorage.setItem('K', JSON.stringify('BLUE'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'K' }))
    })
    // assert
    expect(shown()).toBe('BLUE')
  })

  test('a missing key reaches the parser as null', () => {
    // act
    render(<Probe lsKey='MISSING' />)
    // assert
    expect(shown()).toBe('NONE')
  })

  test('the shape at mount matches the shape after a change', () => {
    // arrange - the bug was that these two disagreed, so anything comparing the value
    // against a literal worked only after the first write
    localStorage.setItem('K', JSON.stringify('RED'))
    render(<Probe lsKey='K' />)
    const atMount = shown()
    // act
    act(() => {
      localStorage.setItem('K', JSON.stringify('RED'))
      window.dispatchEvent(new StorageEvent('storage', { key: 'K' }))
    })
    // assert
    expect(atMount).toBe(shown())
  })
})
