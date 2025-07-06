// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import './MainPage.scss'
import { useSelector } from '../../redux/useSelector'
import { selectTranslation } from '../../redux/page/selector'


const FEATURES = [
  { name: 'reactions', link: 'reactions' },
  { name: 'kumiteTimer', link: 'kumite-timer' },
  { name: 'intervalTimer', link: 'interval-timer' },
  { name: 'groupStopwatch', link: 'group-stopwatch' },
] as const

export const MainPage = (): JSX.Element => {
  const { mainPage: t } = useSelector(selectTranslation)

  const history = useHistory()

  useEffect(() => {
    if (window.location.search.includes('mirror=true')) {
      history.push('/kumite-timer/mirror')
    }
  }, [window.location.search])

  return (
    <main className='main-page'>
      <h1>OnlineSensei</h1>
      <p>{t.appIntroduction}</p>

      <h2>{t.availableFeatures}:</h2>

      {FEATURES.map(({ name, link }) => (
        <div className='feature-card' key={name}>
          <p className='feature-text'>{t[name].annotation}</p>
          <Link className='feature-link' to={`/${link}`}>{t[name].link}</Link>
        </div>
      ))}
    </main>
  )
}
