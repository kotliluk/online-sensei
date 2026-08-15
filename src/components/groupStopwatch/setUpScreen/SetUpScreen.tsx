import { JSX, useCallback, useEffect, useMemo, useState } from 'react'
import './SetUpScreen.scss'
import { useDispatch } from '../../../redux/useDispatch'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../atoms/button/Button'
import { useSelector } from '../../../redux/useSelector'
import { selectTranslation } from '../../../redux/page/selector'
import { Input } from '../../atoms/input/Input'
import {
  selectGroupStopwatchCompetitors,
  selectGroupStopwatchCompetitorsCount,
} from '../../../redux/groupStopwatch/selector'
import { setGroupStopwatch, setNotActualGroupStopwatch } from '../../../redux/groupStopwatch/actions'
import { NumberInput } from '../../atoms/input/NumberInput'
import useValidatedState from '../../../logic/hooks/useValidatedState'
import { LIMITS, VALIDATOR } from '../../../redux/groupStopwatch/utils'
import { insertWords } from '../../../logic/translation'
import { CompetitorSetup, newCompetitorSetup } from '../../../types/groupStopwatch'
import { ShareButton } from '../../common/shareButton/ShareButton'
import { buildAppUrl } from '../../../logic/urlState/appUrl'
import {
  decodeGroupStopwatchSetUp,
  encodeGroupStopwatchSetUp,
  GROUP_STOPWATCH_SET_UP_PATH,
  hasGroupStopwatchSetUp,
} from '../../../logic/urlState/groupStopwatchUrl'
import { useClearUrlOnEdit } from '../../../logic/urlState/useClearUrlOnEdit'


export const SetUpScreen = (): JSX.Element => {
  const translation = useSelector(selectTranslation)

  const initCompetitorsCount = useSelector(selectGroupStopwatchCompetitorsCount)
  const initCompetitors = useSelector(selectGroupStopwatchCompetitors)

  const [searchParams] = useSearchParams()

  // A shared link fully describes a set up, so it wins over the stored one.
  // Computed once - later edits must not be overwritten by the URL.
  const [init] = useState(() => {
    const stored = { competitorsCount: initCompetitorsCount, competitors: initCompetitors }

    return hasGroupStopwatchSetUp(searchParams) ? decodeGroupStopwatchSetUp(searchParams) : stored
  })

  const [competitorsCount, setCompetitorsCount, isCompetitorsCountValid] = useValidatedState(
    init.competitorsCount,
    VALIDATOR.competitorsCount,
  )
  const [competitors, setCompetitors] = useState(init.competitors.map((c) => newCompetitorSetup(c.name, c.color)))

  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (isCompetitorsCountValid && competitorsCount > competitors.length) {
      const newCompetitors = [...competitors]
      for (let i = competitors.length; i < competitorsCount; i++) {
        newCompetitors[i] = newCompetitorSetup()
      }
      setCompetitors(newCompetitors)
    }
  }, [competitorsCount, isCompetitorsCountValid, competitors])

  const handleCompetitorNameEdit = useCallback((competitors: CompetitorSetup[], index: number, value: string) => {
    const newCompetitors = competitors.map((c) => newCompetitorSetup(c.name, c.color))
    if (!value.includes(',')) {
      newCompetitors[index].name = value
    } else {
      const parts = value.split(',')
      parts.forEach((part, i) => {
        const trimmed = part.trim()
        if (trimmed !== '' && index + i < LIMITS.competitorsCount.max) {
          newCompetitors[index + i].name = trimmed
        }
      })
    }
    setCompetitors(newCompetitors)
  }, [setCompetitors])

  const handleCompetitorColorEdit = useCallback((competitors: CompetitorSetup[], index: number, value: string) => {
    const newCompetitors = competitors.map((c) => newCompetitorSetup(c.name, c.color))
    newCompetitors[index].color = value
    setCompetitors(newCompetitors)
  }, [setCompetitors])

  const handleStart = useCallback(() => {
    dispatch(setGroupStopwatch(competitorsCount, competitors))
    void navigate('/group-stopwatch')
  }, [competitorsCount, competitors])

  const shareParams = useMemo(() => encodeGroupStopwatchSetUp({ competitorsCount, competitors }), [competitorsCount, competitors])

  const buildShareUrl = useCallback(() => buildAppUrl(GROUP_STOPWATCH_SET_UP_PATH, shareParams), [shareParams])

  // the link stops describing the screen as soon as anything is edited
  useClearUrlOnEdit(shareParams)

  const handleBack = useCallback(() => {
    dispatch(setNotActualGroupStopwatch())
    void navigate('/')
  }, [dispatch])

  const validCompetitorsCount = Math.min(
    LIMITS.competitorsCount.max,
    Math.max(LIMITS.competitorsCount.min, competitorsCount),
  )

  const { groupStopwatch: { setUpScreen: t } } = translation

  return (
    <main className='set-up-group-stopwatch'>
      <h1>{t.heading}</h1>

      <ul className='set-up-items'>
        <li className='set-up-item'>
          <label>{t.competitorsCount.label}:</label>
          <NumberInput
            className='set-up-input'
            value={competitorsCount}
            onChange={setCompetitorsCount}
            invalid={!isCompetitorsCountValid}
            errorMessage={insertWords(
              t.competitorsCount.error,
              LIMITS.competitorsCount.min,
              LIMITS.competitorsCount.max,
            )}
          />
        </li>

        <li className='set-up-item'>
          <label>{t.competitors.label}:</label>
        </li>

        {competitors.slice(0, validCompetitorsCount).map((competitor, index) => (
          <li className='set-up-item no-border' key={`competitor-${index}`}>
            <label>{index + 1}:</label>
            <div className='group-inputs'>
              <Input
                type='text'
                value={competitor.name}
                onChange={(value) => handleCompetitorNameEdit(competitors, index, value)}
              />
              <Input
                type='color'
                value={competitor.color}
                onChange={(value) => handleCompetitorColorEdit(competitors, index, value)}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className='buttons'>
        <Button
          className='confirm-btn'
          onClick={handleStart}
          disabled={!isCompetitorsCountValid}
        >
          {translation.common.start}
        </Button>

        <ShareButton
          buildUrl={buildShareUrl}
          disabled={!isCompetitorsCountValid}
        />

        <Button
          className='back-btn'
          onClick={handleBack}
        >
          {translation.common.back}
        </Button>
      </div>
    </main>
  )
}
