// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import './KumiteTimerScreen.scss'
import { FighterStats } from '../fighterStats/FighterStats'
import { LS_KEYS, Senchu } from '../utils'
import { FightStats } from '../fightStats/FightStats'
import { useLSSyncConsumer } from '../../../logic/hooks/useLSSyncConsumer'
import { intOrDefaultParser } from '../../../utils/number'


export const KumiteTimerMirror = (): JSX.Element | null => {
  const [redOnLeft, setRedOnLeft] = useState(true)
  const time = useLSSyncConsumer(LS_KEYS.time, intOrDefaultParser(0))
  const scoreRed = useLSSyncConsumer(LS_KEYS.scoreRed, intOrDefaultParser(0))
  const foulsRed = useLSSyncConsumer(LS_KEYS.foulsRed, intOrDefaultParser(0))
  const scoreBlue = useLSSyncConsumer(LS_KEYS.scoreBlue, intOrDefaultParser(0))
  const foulsBlue = useLSSyncConsumer(LS_KEYS.foulsBlue, intOrDefaultParser(0))
  const senchu = useLSSyncConsumer(LS_KEYS.senchu, (value) => value ? value as Senchu : 'BLUE')

  const handleSwitchSides = useCallback(() => {
    setRedOnLeft(prev => !prev)
  }, [setRedOnLeft])

  const renderRedData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={true}
      score={scoreRed}
      fouls={foulsRed}
      isMirror={true}
    />
  ), [scoreRed, foulsRed])

  const renderBlueData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={false}
      score={scoreBlue}
      fouls={foulsBlue}
      isMirror={true}
    />
  ), [scoreBlue, foulsBlue])

  return (
    <main className='kumite-timer'>
      <div className='timer'>
        {redOnLeft ? renderRedData('left-fighter') : renderBlueData('left-fighter')}
        <FightStats
          className='fight-stats'
          time={time}
          redOnLeft={redOnLeft}
          senchu={senchu}
          isMirror={true}
          onSwitchSides={handleSwitchSides}
        />
        {redOnLeft ? renderBlueData('right-fighter') : renderRedData('right-fighter')}
      </div>
    </main>
  )
}
