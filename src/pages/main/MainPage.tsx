// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import './MainPage.scss'
import { useSelector } from '../../redux/useSelector'
import { selectTranslation } from '../../redux/page/selector'


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

      <div className='feature-card'>
        <p className='feature-text'>{t.reactions.annotation}</p>
        <Link className='feature-link' to='/reactions'>{t.reactions.link}</Link>
      </div>

      <div className='feature-card'>
        <p className='feature-text'>{t.kumiteTimer.annotation}</p>
        <Link className='feature-link' to='/kumite-timer'>{t.kumiteTimer.link}</Link>
      </div>
    </main>
  )
}
