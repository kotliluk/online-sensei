import { JSX, useCallback } from 'react'
import { Select } from '../../atoms/select/Select'
import { VolumeInput } from '../../atoms/input/VolumeInput'
import { BEEP_A, BeepType, getBeepName, NO_BEEP } from '../../../types/beepType'
import { preloadBeep } from '../../../logic/audio/beep'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'


interface SoundSelectProps {
  sound: BeepType
  volume: number
  onSoundChange: (sound: BeepType) => void
  onVolumeChange: (volume: number) => void
}

/**
 * The sound row of a set-up screen: which beep, and how loud.
 *
 * Rendered inside the `set-up-item` list item of the screen that uses it, the way
 * `SetUpAdvancedInterval` is. The styles come from the `set-up-audio-div` mixin, which
 * all three set-up stylesheets already include.
 */
export const SoundSelect = ({ sound, volume, onSoundChange, onVolumeChange }: SoundSelectProps): JSX.Element => {
  const { common: t } = useSelector(selectTranslation)

  // fetched when the sound is picked rather than when it first has to play, so the
  // round that needs it is not waiting on the network
  const handleSoundChange = useCallback((value: string) => {
    preloadBeep(value as BeepType)
    onSoundChange(value as BeepType)
  }, [onSoundChange])

  return (
    <>
      <label>{t.sound}:</label>
      <div className='set-up-volume'>
        <Select
          className='set-up-volume-select'
          selected={sound}
          values={[
            { value: NO_BEEP, text: t.noSound },
            { value: BEEP_A, text: getBeepName(BEEP_A) },
          ]}
          onChange={handleSoundChange}
        />
        <VolumeInput
          inputClassName='set-up-volume-input'
          buttonClassName='set-up-volume-mute'
          value={volume}
          onChange={onVolumeChange}
          disabled={sound === NO_BEEP}
        />
      </div>
    </>
  )
}
