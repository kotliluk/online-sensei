// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import React from 'react'
import { Link } from 'react-router-dom'
import './MainPage.scss'
import { useSelector } from '../../redux/useSelector'
import { selectTranslation } from '../../redux/page/selector'


export const MainPage = (): JSX.Element => {
  const { mainPage: t } = useSelector(selectTranslation)

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
