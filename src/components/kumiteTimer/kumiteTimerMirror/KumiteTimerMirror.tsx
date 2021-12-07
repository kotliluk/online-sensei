// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useCallback, useState } from 'react'
import '../kumiteTimerScreen/KumiteTimerScreen.scss'
import { FighterStats } from '../fighterStats/FighterStats'
import { LS_KEYS, Senchu } from '../utils'
import { FightStats } from '../fightStats/FightStats'
import { useLSSyncConsumer } from '../../../logic/hooks/useLSSyncConsumer'
import { intOrDefaultParser } from '../../../utils/number'


export const KumiteTimerMirror = (): JSX.Element | null => {
  const [redOnLeft, setRedOnLeft] = useState(true)
  const time = useLSSyncConsumer(LS_KEYS.time, intOrDefaultParser(0))
  const scoreRed = useLSSyncConsumer(LS_KEYS.scoreRed, intOrDefaultParser(0))
  const foulsOneRed = useLSSyncConsumer(LS_KEYS.foulsOneRed, intOrDefaultParser(0))
  const foulsTwoRed = useLSSyncConsumer(LS_KEYS.foulsTwoRed, intOrDefaultParser(0))
  const scoreBlue = useLSSyncConsumer(LS_KEYS.scoreBlue, intOrDefaultParser(0))
  const foulsOneBlue = useLSSyncConsumer(LS_KEYS.foulsOneBlue, intOrDefaultParser(0))
  const foulsTwoBlue = useLSSyncConsumer(LS_KEYS.foulsTwoBlue, intOrDefaultParser(0))
  const senchu = useLSSyncConsumer(LS_KEYS.senchu, (value) => value ? value as Senchu : 'BLUE')

  const handleSwitchSides = useCallback(() => {
    setRedOnLeft(prev => !prev)
  }, [setRedOnLeft])

  const renderRedData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={true}
      score={scoreRed}
      foulsOne={foulsOneRed}
      foulsTwo={foulsTwoRed}
      isMirror={true}
    />
  ), [scoreRed, foulsOneRed, foulsTwoRed])

  const renderBlueData = useCallback((className: string) => (
    <FighterStats
      className={className}
      isRed={false}
      score={scoreBlue}
      foulsOne={foulsOneBlue}
      foulsTwo={foulsTwoBlue}
      isMirror={true}
    />
  ), [scoreBlue, foulsOneBlue, foulsTwoBlue])

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
