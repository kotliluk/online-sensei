import { vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Provider as ReduxProvider } from 'react-redux'
import { SoundSelect } from '../SoundSelect'
import { store } from '../../../../redux/store'
import { BEEP_A, BeepType, NO_BEEP } from '../../../../types/beepType'
import { emptyFunc } from '../../../../utils/function'


/**
 * As elsewhere in this repo, only the last step out to the browser is replaced: preloading
 * a beep reaches for `new Audio(...).play()`, which jsdom has not got. Whether a phone
 * really warms the file up is not a question a mock can answer - that belongs on a device.
 * What is checked here is what the row reports back to the screen around it.
 */
vi.mock('../../../../logic/audio/beep', () => ({ preloadBeep: (): void => {} }))

const renderRow = (
  sound: BeepType,
  volume = 0.5,
  onSoundChange: (sound: BeepType) => void = emptyFunc,
  onVolumeChange: (volume: number) => void = emptyFunc,
): void => {
  render(
    <ReduxProvider store={store}>
      <ul>
        <li className='set-up-item'>
          <SoundSelect
            sound={sound}
            volume={volume}
            onSoundChange={onSoundChange}
            onVolumeChange={onVolumeChange}
          />
        </li>
      </ul>
    </ReduxProvider>,
  )
}

const soundSelect = (): HTMLSelectElement => screen.getByRole('combobox')
const volumeSlider = (): HTMLInputElement => screen.getByRole('slider')
const muteButton = (): HTMLButtonElement => screen.getByRole('button')

/**
 * One row shared by the three set-up screens, so a mistake in it is a mistake in all three
 * at once - and none of those screens has a test of its own to catch it on the way past.
 */
describe('SoundSelect', () => {
  test('reports the beep that was picked', () => {
    // arrange
    const picked: BeepType[] = []
    renderRow(NO_BEEP, 0.5, (sound) => picked.push(sound))
    // act
    fireEvent.change(soundSelect(), { target: { value: BEEP_A } })
    // assert
    expect(picked).toEqual([BEEP_A])
  })

  test('reports the volume as a fraction of the slider', () => {
    // arrange - the slider counts to a hundred, the rest of the app works in fractions
    const volumes: number[] = []
    renderRow(BEEP_A, 0.5, emptyFunc, (volume) => volumes.push(volume))
    // act
    fireEvent.change(volumeSlider(), { target: { value: '40' } })
    // assert
    expect(volumes).toEqual([0.4])
  })

  test('shows the volume it was given', () => {
    // act
    renderRow(BEEP_A, 0.25)
    // assert - the value travels the other way through the same hundredfold
    expect(volumeSlider().value).toBe('25')
  })

  /**
   * With no sound chosen there is nothing to be loud, so the volume controls go dead rather
   * than sitting there setting a level for silence.
   */
  test.each<{ name: string, sound: BeepType, expected: boolean }>([
    { name: 'no sound', sound: NO_BEEP, expected: true },
    { name: 'a beep', sound: BEEP_A, expected: false },
  ])('turns the volume off for $name', ({ sound, expected }) => {
    // act
    renderRow(sound)
    // assert
    expect(volumeSlider().disabled).toBe(expected)
    expect(muteButton().disabled).toBe(expected)
  })
})
